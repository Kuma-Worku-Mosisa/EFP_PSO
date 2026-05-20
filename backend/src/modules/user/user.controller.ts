import { Request, Response } from "express";
import { validationResult } from "express-validator";
import * as UserService from "./user.service";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Retrieves a list of all application users with their respective roles.
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
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
    const newUser = await UserService.createUser({
      username: req.body.username,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      password_hash: req.body.password,
      faydaId: req.body.faydaId,
      photoUrl: req.body.photoUrl,
      roleIds: req.body.roleIds || [2],
    });

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

    const roles = user.user_roles?.map((ur) => ur.roles.role_name) || [];
    if (roles.length === 0) {
      return ApiResponse.error(
        res,
        "Access Denied: Account holds no active system assignments.",
        403,
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        roles: roles,
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
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
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

    const user = await UserService.administrativeRevokeAccess(id);
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
