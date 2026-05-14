// filepath: backend/src/modules/position/position.controller.ts
import { Request, Response } from "express";
import { PositionService } from "./position.service";
import {
  createPositionSchema,
  assignEmployeeSchema,
  updatePositionSchema,
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

    res.status(201).json({
      success: true,
      message: "Employee assigned to position",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Assignment failed" });
  }
};

export const updatePosition = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const validatedData = updatePositionSchema.parse(req.body);
    const position = await PositionService.updatePosition(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Position updated successfully",
      data: position,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Position name already exists" });
    }
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deletePosition = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    await PositionService.deletePosition(id);
    res
      .status(200)
      .json({ success: true, message: "Position deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};
