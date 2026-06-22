import { Router } from "express";
import { listAuditLogs } from "./audit.controller";
import { getDashboardSummary } from "./admin.controller.ts";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/role";

const router = Router();

// GET /api/admin/audit-logs?limit=1000
router.get(
  "/audit-logs",
  authenticate,
  // Restricted to `system_admin` only for audit log access
  authorize(["system_admin"]),
  listAuditLogs,
);

// GET /api/admin/summary - Administrative dashboard overview (counts)
router.get(
  "/summary",
  authenticate,
  authorize(["admin", "system_admin", "super_admin"]),
  getDashboardSummary,
);

export default router;
