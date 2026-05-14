// filepath: backend/src/modules/position/position.routes.ts
import { Router } from "express";
import {
  createPosition,
  getAllPositions,
  assignEmployee,
} from "./position.controller";

const router = Router();

// Position Management
router.post("/", createPosition);
router.get("/", getAllPositions);

// Employee-Position Assignments
router.post("/assign", assignEmployee);

export default router;
