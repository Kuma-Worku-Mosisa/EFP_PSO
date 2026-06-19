import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  getMyOrganizationHandler,
  registerEmployeeHandler,
} from "./employee.controller";

const router = Router();

/**
 * POST /api/employees/register
 * Requires authentication and admin/system_admin/super_admin privileges
 */
router.post(
  "/register",
  authenticate,
  authorize(["admin", "system_admin", "super_admin", "org_hr_manager"]),
  registerEmployeeHandler,
);

/**
 * GET /api/employees/my-organization
 * Requires authentication
 */
router.get("/my-organization", authenticate, getMyOrganizationHandler);

export default router;
