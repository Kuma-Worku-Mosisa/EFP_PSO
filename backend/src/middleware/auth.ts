// filepath: backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse";

/**
 * Global authentication middleware extracting and normalizing signed incoming JWT tokens.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.error(res, "Access denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    );

    const payload = decoded as any;
    const rawRoles = payload.roles;

    // Normalize string tokens or pre-formatted arrays cleanly into a standard string array
    const roles: string[] = Array.isArray(rawRoles)
      ? rawRoles
      : typeof rawRoles === "string"
        ? rawRoles
            .split(",")
            .map((role: string) => role.trim())
            .filter(Boolean)
        : [];

    // Safely assign properties to the augmented Express request context
    req.user = {
      ...payload,
      id: payload.id ?? payload.userId,
      userId: payload.userId ?? payload.id,
      roles,
    };

    return next();
  } catch (error) {
    return ApiResponse.error(res, "Invalid or expired token.", 403);
  }
};

/**
 * Role-Based Access Control (RBAC) authorization middleware.
 * Restricts route access based on arrays of permitted system groups.
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return ApiResponse.error(
        res,
        "Access Denied: Authentication context missing.",
        401,
      );
    }

    // Evaluate matching constraints against the user's active permissions matrix
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      String(role).toLowerCase(),
    );
    const hasAccess = req.user.roles.some((role) =>
      normalizedAllowedRoles.includes(String(role).toLowerCase()),
    );

    if (!hasAccess) {
      return ApiResponse.error(
        res,
        "Access Denied: Insufficient system privileges.",
        403,
      );
    }

    return next();
  };
};
