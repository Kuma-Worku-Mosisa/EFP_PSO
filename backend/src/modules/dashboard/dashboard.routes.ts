import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/agency", authenticate, DashboardController.getAgencySummary);
router.get("/system", authenticate, DashboardController.getSystemSummary);

export default router;
