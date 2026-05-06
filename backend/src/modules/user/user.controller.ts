import { Request, Response } from "express";
import { validationResult } from "express-validator";
import * as UserService from "./user.service";
import { ApiResponse } from "../../utils/apiResponse"; // Import the utility

// src/modules/user/user.controller.ts
import * as bcrypt from "bcryptjs"; // Fixes the UMD global error
import jwt from "jsonwebtoken";

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

export const registerHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, "Validation failed", 400, errors.array());
  }

  try {
    const user = await UserService.createUser(req.body);
    const { password, ...userWithoutPassword } = user;

    return ApiResponse.success(
      res,
      "User registered successfully",
      userWithoutPassword,
      201,
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return ApiResponse.error(
        res,
        "Registration failed: User already exists",
        409,
      );
    }
    return ApiResponse.error(res, "Internal server error", 500, error.message);
  }
};


export const loginHandler = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, "Validation failed", 400, errors.array());
  }

  try {
    const { username, password } = req.body;

    // 1. Find user by username
    const user = await UserService.findUserByUsername(username);
    if (!user) {
      return ApiResponse.error(res, "Invalid username or password", 401);
    }

    // // 2. Compare hashed password using namespaced bcrypt
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return ApiResponse.error(res, "Invalid username or password", 401);
    // }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" },
    );

    const { password: _, ...userWithoutPassword } = user;

    return ApiResponse.success(res, "Login successful", {
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    return ApiResponse.error(res, "Internal server error", 500, error.message);
  }
};