import { Request, Response } from "express";
import { EfpPositionService } from "./efpPosition.service";
import {
  createEfpPositionSchema,
  updateEfpPositionSchema,
} from "./efpPosition.validation";

export const getAllEfpPositions = async (req: Request, res: Response) => {
  try {
    const positions = await EfpPositionService.getAll();
    res.status(200).json({ success: true, data: positions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Federal Police positions",
    });
  }
};

export const getEfpPositionById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const position = await EfpPositionService.getById(id);
    if (!position) {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }

    res.status(200).json({ success: true, data: position });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Federal Police position",
    });
  }
};

export const createEfpPosition = async (req: Request, res: Response) => {
  try {
    const validatedData = createEfpPositionSchema.parse(req.body);
    const position = await EfpPositionService.createPosition(validatedData);

    res.status(201).json({
      success: true,
      message: "Federal Police position created successfully",
      data: position,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      const message =
        target.includes("en_name") || target.includes("nameEnglish")
          ? "English position name already exists"
          : target.includes("am_name") || target.includes("nameAmharic")
            ? "Amharic position name already exists"
            : "EFP position name already exists";
      return res.status(409).json({ success: false, message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateEfpPosition = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const validatedData = updateEfpPositionSchema.parse(req.body);
    const position = await EfpPositionService.updatePosition(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Federal Police position updated successfully",
      data: position,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      const message =
        target.includes("en_name") || target.includes("nameEnglish")
          ? "English position name already exists"
          : target.includes("am_name") || target.includes("nameAmharic")
            ? "Amharic position name already exists"
            : "EFP position name already exists";
      return res.status(409).json({ success: false, message });
    }
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteEfpPosition = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    await EfpPositionService.deletePosition(id);
    res.status(200).json({
      success: true,
      message: "Federal Police position deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Position not found" });
    }
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};
