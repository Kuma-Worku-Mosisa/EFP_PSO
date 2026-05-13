import { Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse";

/**
 * Middleware to restrict access based on user roles.
 * Must be used AFTER the authenticate middleware.
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // 1. Check if user exists (attached by authenticate middleware)
    if (!req.user) {
      return ApiResponse.error(res, "User authentication required.", 401);
    }

    // 2. Extract roles from the decoded token (req.user)
    const userRoles: string[] = req.user.roles || [];

    // 3. Check if the user has at least one of the required roles
    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      return ApiResponse.error(
        res,
        `Forbidden: This action requires one of the following roles: ${allowedRoles.join(", ")}`,
        403,
      );
    }

    // 4. User has permission, proceed to the controller
    next();
  };
};
