// filepath: backend/src/modules/position/position.routes.ts
import { Router } from "express";
import {
  createPosition,
  getAllPositions,
  getPositionById,
  assignEmployee,
  updatePosition,
  deletePosition,
} from "./position.controller";

const router = Router();

// Position Management
router.post("/", createPosition);
router.get("/", getAllPositions);
router.get("/:id", getPositionById);
router.put("/:id", updatePosition);
router.delete("/:id", deletePosition);

// Employee-Position Assignments
router.post("/assign", assignEmployee);

export default router;
