import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  getMyOrganizationHandler,
  registerEmployeeHandler,
  updateEmployeeBlacklistHandler,
  updateEmployeeStatusHandler,
} from "./employee.controller";

const router = Router();

/**
 * POST /api/employees/register
 * Requires authentication and admin/system_admin/super_admin privileges
 */
router.post(
  "/register",
  authenticate,
  authorize(["org_hr_manager"]),
  registerEmployeeHandler,
);

router.patch(
  "/:employeeId/status",
  authenticate,
  authorize([ "org_hr_manager"]),
  updateEmployeeStatusHandler,
);

router.patch(
  "/:employeeId/blacklist",
  authenticate,
  authorize(["admin", "super_admin"]),
  updateEmployeeBlacklistHandler,
);

/**
 * GET /api/employees/my-organization
 * Requires authentication
 */
router.get("/my-organization", authenticate, getMyOrganizationHandler);

export default router;
