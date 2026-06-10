import { Router } from "express";
import {
  createEfpPosition,
  getAllEfpPositions,
  getEfpPositionById,
  updateEfpPosition,
  deleteEfpPosition,
} from "./efpPosition.controller";

const router = Router();

router.get("/", getAllEfpPositions);
router.get("/:id", getEfpPositionById);
router.post("/", createEfpPosition);
router.put("/:id", updateEfpPosition);
router.delete("/:id", deleteEfpPosition);

export default router;
