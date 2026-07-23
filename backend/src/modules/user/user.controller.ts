import { Request, Response } from "express";
import { validationResult } from "express-validator";
import * as UserService from "./user.service";
import { ServiceError } from "./user.service";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import dns from "dns";
import { promisify } from "util";
import { buildPrefixedFilename } from "../../middleware/fileUpload";
import { sendSystemEmail } from "../../utils/emailService";
import { createOtpForUser, verifyOtpForUser } from "./otp.service";

const dnsResolveMx = promisify(dns.resolveMx);

const validateEmailDomain = async (email: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const domain = email.split("@")[1];
    if (!domain) {
      return { valid: false, error: "Invalid email format" };
    }

    // Check if the domain has MX records
    const mxRecords = await dnsResolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, error: "Email domain does not exist or cannot receive emails" };
    }

    return { valid: true };
  } catch (error: any) {
    // Check if it's a DNS lookup failure (domain doesn't exist)
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return { valid: false, error: "Email domain does not exist" };
    }

    // For other DNS errors (temporary issues), we'll allow but log the error
    console.warn("Email domain validation encountered temporary DNS issue:", error);
    return { valid: true };
  }
};

const getAuditContext = (req: Request) => {
  const rawUserId = req.user?.userId ?? req.user?.id ?? null;
  const normalizedUserId =
    typeof rawUserId === "string"
      ? Number(rawUserId)
      : typeof rawUserId === "number"
        ? rawUserId
        : null;

  return {
    userId:
      normalizedUserId !== null && Number.isFinite(normalizedUserId)
        ? normalizedUserId
        : null,
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
};

/**
 * Retrieves a list of all application users with their respective roles.
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const roleFilter =
      typeof req.query.role === "string" ? req.query.role : null;
    const users = roleFilter
      ? await UserService.getUsersByRole(roleFilter)
      : await UserService.getAllUsers();
    return ApiResponse.success(res, "Users retrieved successfully", users);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      "Failed to retrieve users",
      500,
      error.message,
    );
  }
};

/**
 * Returns a single user profile by ID for administrative inspection workflows.
 */
export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return ApiResponse.error(res, "User ID is required", 400);
    }

    // Wrap id in String() to resolve TS2345 type error (string | string[] to string)
    const user = await UserService.getUserById(String(id));

    return ApiResponse.success(res, "User retrieved successfully", user);
  } catch (error: any) {
    if (error?.code === "NOT_FOUND") {
      return ApiResponse.error(res, error.message, 404);
    }
    if (error?.code === "BAD_REQUEST") {
      return ApiResponse.error(res, error.message, 400);
    }

    return ApiResponse.error(
      res,
      "Failed to retrieve user",
      500,
      error?.message ?? String(error),
    );
  }
};

/**
 * Returns the authenticated user's own profile for client-side prefill and account-driven workflows.
 */
export const getCurrentUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    const user = await UserService.getUserById(userId);
    return ApiResponse.success(res, "Current user profile retrieved", user);
  } catch (error: any) {
    // If the user was not found, return a 404 rather than a 500 to reduce noise
    if (error && error.code === "NOT_FOUND") {
      console.warn("Get Current User: user not found", {
        attemptedUserId: req.user?.userId ?? req.user?.id ?? null,
      });
      return ApiResponse.error(res, "User profile does not exist", 404);
    }

    console.error("Get Current User Error:", error?.message ?? error);
    return ApiResponse.error(
      res,
      "Failed to retrieve current user profile",
      500,
      error?.message ?? String(error),
    );
  }
};

/**
 * Dynamic operational handler fetching available system roles directly from Prisma schema collections.
 */
export const getRolesHandler = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.roles.findMany({
      orderBy: {
        role_name: "asc",
      },
    });
    return ApiResponse.success(
      res,
      "System roles retrieved successfully",
      roles,
    );
  } catch (error: any) {
    console.error("Fetch Roles Error:", error);
    return ApiResponse.error(
      res,
      "Failed to retrieve operational application roles metadata directories.",
      500,
      error.message,
    );
  }
};

/**
 * Handles account registrations, processing validation exceptions and duplicate entries safely.
 */
export const registerHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, "Validation failed", 400, errors.array());
  }

  try {
    const newUser = await UserService.createUserWithAudit(
      {
        username: req.body.username,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        password_hash: req.body.password,
        faydaId: req.body.faydaId,
        photoUrl: req.body.photoUrl,
        roleIds: Array.isArray(req.body.roleIds) ? req.body.roleIds : [],
      },
      getAuditContext(req),
    );

    return ApiResponse.success(
      res,
      "User registered successfully",
      newUser,
      201,
    );
  } catch (error: any) {
    if (
      [
        "DUPLICATE_USERNAME",
        "DUPLICATE_EMAIL",
        "DUPLICATE_PHONE",
        "DUPLICATE_FAYDA",
      ].includes(error.code)
    ) {
      return ApiResponse.error(res, error.message, 409);
    }
    return ApiResponse.error(res, "Internal server error", 500, error.message);
  }
};

export const sendLoginOtpHandler = async (req: Request, res: Response) => {
  try {
    const identifier = String(req.body?.identifier || "").trim();
    const password = String(req.body?.password || "").trim();
    const method = String(req.body?.method || "email")
      .trim()
      .toLowerCase();

    if (!identifier) {
      return ApiResponse.error(res, "Username or email is required", 400);
    }

    if (!password) {
      return ApiResponse.error(res, "Password is required", 400);
    }

    if (method !== "email") {
      return ApiResponse.error(
        res,
        "Only email OTP is currently supported",
        400,
      );
    }

    const user = await UserService.findUserByUsername(identifier);
    if (!user) {
      return ApiResponse.error(res, "Invalid username or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return ApiResponse.error(res, "Invalid username or password", 401);
    }

    const otp = createOtpForUser(identifier, user.email);
    const subject = "Your EFP-PSO login verification code";
    const body = `Hello ${user.fullName || user.username},\n\nYour verification code is ${otp.code}.\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.`;

    await sendSystemEmail(user.email, subject, body);

    return ApiResponse.success(res, "Verification code sent successfully", {
      email: user.email,
      expiresInMinutes: otp.expiresInMinutes,
    });
  } catch (error: any) {
    console.error("Send Login OTP Error:", error);
    return ApiResponse.error(
      res,
      "Failed to send verification code",
      500,
      error.message,
    );
  }
};

export const verifyLoginOtpHandler = async (req: Request, res: Response) => {
  try {
    const identifier = String(req.body?.identifier || "").trim();
    const code = String(req.body?.code || "").trim();

    if (!identifier || !code) {
      return ApiResponse.error(
        res,
        "Identifier and verification code are required",
        400,
      );
    }

    const result = verifyOtpForUser(identifier, code);
    if (!result.valid) {
      return ApiResponse.error(
        res,
        result.reason === "expired"
          ? "Verification code has expired. Please request a new one."
          : "Invalid verification code",
        400,
      );
    }

    return ApiResponse.success(res, "Verification code accepted", {
      verified: true,
    });
  } catch (error: any) {
    console.error("Verify Login OTP Error:", error);
    return ApiResponse.error(
      res,
      "Failed to verify verification code",
      500,
      error.message,
    );
  }
};

export const validateUserFieldHandler = async (req: Request, res: Response) => {
  const field = String(req.query.field || "").trim();
  const value = String(req.query.value || "").trim();

  const allowedFields = ["username", "email", "phone", "faydaId"];
  if (!field || !value) {
    return ApiResponse.error(res, "Field and value are required", 400);
  }

  if (!allowedFields.includes(field)) {
    return ApiResponse.error(
      res,
      "Validation field must be username, email, phone, or faydaId",
      400,
    );
  }

  const isFaydaId = field === "faydaId";
  const validFormat = !isFaydaId || /^\d{12}$/.test(value);

  if (isFaydaId && !validFormat) {
    return ApiResponse.success(res, "Validation completed", {
      field,
      exists: false,
      validFormat: false,
      message: "Fayda ID must be exactly 12 digits.",
    });
  }

  const existing = await UserService.findUserByUniqueField(
    field as "username" | "email" | "phone" | "faydaId",
    value,
  );

  const existingValue = existing
    ? String((existing as any)[field] ?? "")
    : null;
  const exactMatch = existingValue !== null ? existingValue === value : false;

  return ApiResponse.success(res, "Validation completed", {
    field,
    exists: Boolean(existing),
    validFormat: true,
    existingValue,
    exactMatch,
  });
};

export const sendRegisterEmailOtpHandler = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || "").trim();

    if (!email) {
      return ApiResponse.error(res, "Email is required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiResponse.error(res, "Invalid email format", 400);
    }

    // Validate email domain has MX records
    const domainValidation = await validateEmailDomain(email);
    if (!domainValidation.valid) {
      return ApiResponse.error(
        res,
        domainValidation.error || "Email domain does not exist or cannot receive emails",
        400,
      );
    }

    // Check if email already exists
    const existingUser = await UserService.findUserByUniqueField("email", email);
    if (existingUser) {
      return ApiResponse.error(res, "Email already registered", 409);
    }

    // Generate and store OTP
    const otp = createOtpForUser(email, email);
    const subject = "Verify your email for EFP-PSO registration";
    const body = `Hello,\n\nYour email verification code is ${otp.code}.\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.`;

    await sendSystemEmail(email, subject, body);

    return ApiResponse.success(res, "Verification code sent successfully", {
      email,
      expiresInMinutes: otp.expiresInMinutes,
    });
  } catch (error: any) {
    console.error("Send Register Email OTP Error:", error);
    return ApiResponse.error(
      res,
      "Failed to send verification code",
      500,
      error.message,
    );
  }
};

export const verifyRegisterEmailOtpHandler = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || "").trim();
    const code = String(req.body?.code || "").trim();

    if (!email || !code) {
      return ApiResponse.error(
        res,
        "Email and verification code are required",
        400,
      );
    }

    const result = verifyOtpForUser(email, code);
    if (!result.valid) {
      return ApiResponse.error(
        res,
        result.reason === "expired"
          ? "Verification code has expired. Please request a new one."
          : "Invalid verification code",
        400,
      );
    }

    return ApiResponse.success(res, "Email verified successfully", {
      verified: true,
      email,
    });
  } catch (error: any) {
    console.error("Verify Register Email OTP Error:", error);
    return ApiResponse.error(
      res,
      "Failed to verify email",
      500,
      error.message,
    );
  }
};

/**
 * Handles secure credential verification and bundles associated user roles directly inside the JWT.
 */
export const loginHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, "Validation failed", 400, errors.array());
  }

  try {
    const { username, password } = req.body;

    const user = await UserService.findUserByUsername(username);
    if (!user) {
      return ApiResponse.error(res, "Invalid username or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return ApiResponse.error(res, "Invalid username or password", 401);
    }

    const normalizedStatus = String(user.status ?? "").toUpperCase();
    if (normalizedStatus !== "ACTIVE") {
      const message =
        normalizedStatus === "SUSPENDED"
          ? "Your account has been suspended. Contact your administrator."
          : "Your account is inactive. Contact your administrator.";
      return ApiResponse.error(res, message, 403);
    }

    const roles = user.user_roles?.map((ur) => ur.roles.role_name) || [];
    if (roles.length === 0) {
      return ApiResponse.error(
        res,
        "Access Denied: Account holds no active system assignments.",
        403,
      );
    }

    const organizationId = user.employee?.organizationId ?? null;

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        roles: roles,
        ...(organizationId && { organizationId }),
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" },
    );

    const { password: _, ...cleanUser } = user;

    return ApiResponse.success(res, "Login successful", {
      token,
      user: {
        ...cleanUser,
        roles,
        organizationId,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);

    if (error instanceof ServiceError) {
      const statusCode = error.code === "DB_UNAVAILABLE" ? 503 : 400;
      return ApiResponse.error(res, error.message, statusCode, error.code);
    }

    return ApiResponse.error(res, "Internal server error", 500, error.message);
  }
};

/**
 * Dynamic profile updater supporting user modifications and multi-role sync modifications via Admins.
 */
export const updateProfileHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, "Validation failed", 400, errors.array());
  }

  try {
    // Prefer an explicit path parameter for admin updates, then body id, then the authenticated user.
    const targetUserId = req.params.id || req.body.id;
    const authenticatedUserId = req.user?.userId ?? req.user?.id;
    const resolvedUserId = targetUserId || authenticatedUserId;

    if (!resolvedUserId) return ApiResponse.error(res, "Unauthorized", 401);

    // Cast targetUserId to string or number safely to match your UserService signature
    const updated = await UserService.updateUserProfile(
      resolvedUserId as string | number,
      req.body,
      getAuditContext(req),
    );
    return ApiResponse.success(res, "Profile updated successfully", updated);
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    if (error.code === "NOT_FOUND")
      return ApiResponse.error(res, error.message, 404);
    return ApiResponse.error(
      res,
      "Failed to update profile",
      500,
      error.message,
    );
  }
};

/**
 * Core security updater replacing old validated strings with newly confirmed values.
 */
export const changePasswordHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, "Validation failed", 400, errors.array());
  }

  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) return ApiResponse.error(res, "Unauthorized", 401);

    const { currentPassword, newPassword } = req.body;

    await UserService.changeUserPassword(
      userId as string | number,
      currentPassword,
      newPassword,
      getAuditContext(req),
    );

    return ApiResponse.success(res, "Password changed successfully");
  } catch (error: any) {
    console.error("Change Password Error:", error);
    if (error.code === "INVALID_CURRENT_PASSWORD") {
      return ApiResponse.error(res, "Current password is incorrect", 400);
    }
    if (error.code === "NOT_FOUND")
      return ApiResponse.error(res, error.message, 404);
    return ApiResponse.error(
      res,
      "Failed to change password",
      500,
      error.message,
    );
  }
};

/**
 * Admin Access Control Revocation (Soft Termination).
 */
export const revokeAccessHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return ApiResponse.error(
        res,
        "User identity parameter missing or invalid",
        400,
      );
    }

    const user = await UserService.administrativeRevokeAccess(
      id,
      getAuditContext(req),
    );
    return ApiResponse.success(
      res,
      "User permissions revoked and disabled successfully",
      user,
    );
  } catch (error: any) {
    console.error("Revoke Access Error:", error);
    return ApiResponse.error(
      res,
      "Failed to execute access revocation",
      500,
      error.message,
    );
  }
};

/**
 * Accepts a single profile photo upload, stores it under uploads/users/{userId}/
 * updates the user's `photoUrl` and returns the updated user object.
 */
export const uploadProfilePhotoHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId) return ApiResponse.error(res, "Unauthorized", 401);

    // Resolve user's full name for folder naming (fall back to username)
    let fullName = "";
    try {
      const userRecord = await UserService.getUserById(userId);
      fullName = String(userRecord?.fullName || userRecord?.username || "");
    } catch (e) {
      // If fetching fails, continue with empty fullName
      fullName = "";
    }

    const sanitizeFolder = (value: string) =>
      value
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase()
        .slice(0, 120);

    const folderSuffix = fullName ? sanitizeFolder(fullName) : "";

    // Build folder name as userId + fullName (concatenated)
    const userFolderName = `${String(userId)}${folderSuffix ? `-${folderSuffix}` : ""}`;

    // Configure storage dynamically so we can use the authenticated user id + fullname
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "users",
      userFolderName,
    );
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) =>
        cb(null, buildPrefixedFilename("photo", file.originalname)),
    });

    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }).single("photo");

    upload(req as any, res as any, async (err: any) => {
      if (err) {
        console.error("Profile photo upload error:", err.message || err);
        return ApiResponse.error(
          res,
          "Failed to upload photo",
          400,
          err.message || String(err),
        );
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return ApiResponse.error(res, "No file uploaded", 400);

      const relativePath = `/uploads/users/${userFolderName}/${file.filename}`;

      try {
        const updated = await UserService.updateUserProfile(
          userId as string | number,
          { photoUrl: relativePath },
          getAuditContext(req),
        );

        return ApiResponse.success(res, "Profile photo uploaded", updated);
      } catch (updateErr: any) {
        console.error("Failed to persist photoUrl:", updateErr);
        return ApiResponse.error(
          res,
          "Failed to save photo information",
          500,
          updateErr?.message || String(updateErr),
        );
      }
    });
  } catch (error: any) {
    console.error("Upload Profile Photo Error:", error);
    return ApiResponse.error(
      res,
      "Failed to upload profile photo",
      500,
      error.message || String(error),
    );
  }
};
