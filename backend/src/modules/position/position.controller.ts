// filepath: backend/src/modules/position/position.controller.ts
import { Request, Response } from "express";
import { PositionService } from "./position.service";
import {
  createPositionSchema,
  assignEmployeeSchema,
} from "./position.validation";

export const createPosition = async (req: Request, res: Response) => {
  try {
    // 1. Validate Input
    const validatedData = createPositionSchema.parse(req.body);

    // 2. Call Service
    const position = await PositionService.createPosition(validatedData);

    // 3. Send Response
    res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: position,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    // Handle Prisma unique constraint error (e.g., duplicate position name)
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Position name already exists" });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllPositions = async (req: Request, res: Response) => {
  try {
    const positions = await PositionService.getAllPositions();
    res.status(200).json({ success: true, data: positions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch positions" });
  }
};

export const assignEmployee = async (req: Request, res: Response) => {
  try {
    const validatedData = assignEmployeeSchema.parse(req.body);
    const assignment = await PositionService.assignEmployee(
      validatedData.employeeId,
      validatedData.positionId,
    );

    res
      .status(201)
      .json({
        success: true,
        message: "Employee assigned to position",
        data: assignment,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Assignment failed" });
  }
};

