// src/modules/user/user.service.ts
import prisma from "../../lib/prisma";
import * as bcrypt from "bcryptjs";
import { createAuditLog } from "../../utils/auditLogger";

// Custom error class to pass readable error codes to controllers
class ServiceError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

// Helper to normalize the ID field safely
const parseUserId = (id: number | string): number => {
  const parsed = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(parsed)) {
    throw new ServiceError("Invalid User ID format", "BAD_REQUEST");
  }
  return parsed;
};

// Base select payload to ensure we never return the hashed password string accidentally
const userSelection = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  phone: true,
  faydaId: true,
  photoUrl: true,
  status: true,
  createdAt: true,
  user_roles: {
    select: {
      role_id: true,
      roles: {
        select: {
          role_name: true,
        },
      },
    },
  },
};

export type UserCreateInput = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password_hash: string;
  faydaId: string;
  photoUrl?: string | null;
  roleIds: number[]; // Explicitly assign roles on creation
  status?: string;
};

export type UserAdminUpdateInput = {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  faydaId?: string;
  photoUrl?: string | null;
  roleIds?: number[]; // To sync new system assignments
  status?: string;
};

type AuditContext = {
  userId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Creates a brand new user and links their initial roles inside a secure Database Transaction.
 */
export const createUser = async (input: UserCreateInput) => {
  // 1. Check for existing unique fields to throw clean, human-readable errors
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: input.username },
        { email: input.email },
        { phone: input.phone },
        { faydaId: input.faydaId },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.username === input.username)
      throw new ServiceError(
        "Username is already taken.",
        "DUPLICATE_USERNAME",
      );
    if (existingUser.email === input.email)
      throw new ServiceError(
        "Email address is already registered.",
        "DUPLICATE_EMAIL",
      );
    if (existingUser.phone === input.phone)
      throw new ServiceError(
        "Phone number is already linked to an account.",
        "DUPLICATE_PHONE",
      );
    if (existingUser.faydaId === input.faydaId)
      throw new ServiceError(
        "Fayda ID is already registered.",
        "DUPLICATE_FAYDA",
      );
  }

  // 2. Encrypt password safely
  const hashedPassword = await bcrypt.hash(input.password_hash, 12);

  // 3. Execute writing user and user_roles simultaneously
  return await prisma.$transaction(async (tx) => {
    const defaultRoleId = async () => {
      const agencyRole = await tx.roles.upsert({
        where: { role_name: "agency" },
        update: {},
        create: { role_name: "agency" },
      });

      return agencyRole.role_id;
    };

    const resolvedRoleIds =
      input.roleIds.length > 0 ? input.roleIds : [await defaultRoleId()];

    const newUser = await tx.user.create({
      data: {
        username: input.username,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        faydaId: input.faydaId,
        photoUrl: input.photoUrl ?? null,
        password: hashedPassword,
        ...(input.status && { status: input.status }),
        // Nested write logic into junction table
        user_roles: {
          create: resolvedRoleIds.map((rId) => ({
            role_id: rId,
          })),
        },
      },
      select: userSelection,
    });
    return newUser;
  });
};

export const createUserWithAudit = async (
  input: UserCreateInput,
  audit?: AuditContext,
) => {
  const createdUser = await createUser(input);

  await createAuditLog(prisma, {
    userId: audit?.userId ?? null,
    action: "CREATE",
    entityName: "User",
    entityId: createdUser.id,
    oldValue: null,
    newValue: JSON.stringify(createdUser),
    ipAddress: audit?.ipAddress ?? null,
    userAgent: audit?.userAgent ?? null,
  });

  return createdUser;
};

/**
 * Fetches all registered users along with their linked structural roles.
 */
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: userSelection,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Returns users that have the given role name (case-insensitive).
 */
export const getUsersByRole = async (roleName: string) => {
  const normalized = (roleName || "").trim().toLowerCase();
  return await prisma.user.findMany({
    where: {
      user_roles: {
        some: {
          roles: {
            role_name: {
              equals: normalized,
            },
          },
        },
      },
    },
    select: userSelection,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Locates a single specific user profile by its ID.
 */
export const getUserById = async (userId: number | string) => {
  const id = parseUserId(userId);
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelection,
  });

  if (!user)
    throw new ServiceError("User profile does not exist.", "NOT_FOUND");
  return user;
};

/**
 * Finds a single user by their unique username string (Useful during Authentication workflows).
 */
export const findUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: { username },
    select: {
      ...userSelection,
      password: true, // Keep explicit for validation checks inside login handlers
    },
  });
};

/**
 * Comprehensive update handler allowing Admins to change user details and completely sync permissions safely.
 */
export const updateUserProfile = async (
  userId: number | string,
  input: UserAdminUpdateInput,
  audit?: AuditContext,
) => {
  const id = parseUserId(userId);

  // Verify user exists first
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: userSelection,
  });
  if (!existingUser) throw new ServiceError("User not found", "NOT_FOUND");

  return await prisma.$transaction(async (tx) => {
    // If roles array is supplied, replace existing assignments entirely
    if (input.roleIds) {
      // First clear old assignments
      await tx.user_roles.deleteMany({
        where: { user_id: id },
      });

      // Insert new array mapping
      await tx.user_roles.createMany({
        data: input.roleIds.map((rId) => ({
          user_id: id,
          role_id: rId,
        })),
      });
    }

    // Update individual profile table components
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        username: input.username,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        faydaId: input.faydaId,
        ...(input.status && { status: input.status }),
        photoUrl: input.photoUrl,
      },
      select: userSelection,
    });

    await createAuditLog(tx, {
      userId: audit?.userId ?? null,
      action: "UPDATE",
      entityName: "User",
      entityId: id,
      oldValue: JSON.stringify(existingUser),
      newValue: JSON.stringify(updatedUser),
      ipAddress: audit?.ipAddress ?? null,
      userAgent: audit?.userAgent ?? null,
    });

    return updatedUser;
  });
};

/**
 * Changes a user's password securely after verifying their previous hash value.
 */
export const changeUserPassword = async (
  userId: number | string,
  currentPassword: string,
  newPassword: string,
  audit?: AuditContext,
) => {
  const id = parseUserId(userId);

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user)
    throw new ServiceError("User profile could not be verified", "NOT_FOUND");

  const newHashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    const passwordRecord = await tx.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!passwordRecord) {
      throw new ServiceError("User profile could not be verified", "NOT_FOUND");
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      passwordRecord.password,
    );
    if (!isMatch)
      throw new ServiceError(
        "Current password configuration is invalid",
        "INVALID_CURRENT_PASSWORD",
      );

    await tx.user.update({
      where: { id },
      data: { password: newHashedPassword },
    });

    await createAuditLog(tx, {
      userId: audit?.userId ?? null,
      action: "UPDATE",
      entityName: "UserPassword",
      entityId: id,
      oldValue: null,
      newValue: JSON.stringify({ userId: id, passwordChanged: true }),
      ipAddress: audit?.ipAddress ?? null,
      userAgent: audit?.userAgent ?? null,
    });
  });

  return true;
};

/**
 * Administrative Access Control Revocation (Soft Termination).
 * Removes permissions from junction table so user loses full system access,
 * but safely keeps the main record row intact to satisfy legal/inspection tracking integrity constraints.
 */
export const administrativeRevokeAccess = async (
  userId: number | string,
  audit?: AuditContext,
) => {
  const id = parseUserId(userId);

  return await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { id },
      select: userSelection,
    });

    if (!existingUser) {
      throw new ServiceError("User not found", "NOT_FOUND");
    }

    // Clear roles completely to lock out user from system routes entirely
    await tx.user_roles.deleteMany({
      where: { user_id: id },
    });

    await createAuditLog(tx, {
      userId: audit?.userId ?? null,
      action: "UPDATE",
      entityName: "UserAccess",
      entityId: id,
      oldValue: JSON.stringify(existingUser),
      newValue: JSON.stringify({
        ...existingUser,
        user_roles: [],
        accessRevoked: true,
      }),
      ipAddress: audit?.ipAddress ?? null,
      userAgent: audit?.userAgent ?? null,
    });

    // We clear out the photo url or set other identifiers to note inactivation if necessary
    return await tx.user.findUnique({
      where: { id },
      select: userSelection,
    });
  });
};

/* 
  ===========================================================
  FAYDA ID NATIONAL REGISTRY OTP VALIDATION FLOW
  ===========================================================
  export const verifyFaydaOtp = async (faydaId: string, otp: string) => {
    // Federal Verification API endpoint logic integration goes here
    return true; 
  };
*/
