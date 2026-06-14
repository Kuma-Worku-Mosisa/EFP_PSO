import { Router } from "express";
import { getMyOrganizationHandler } from "./employee.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/employees/my-organization
 * Requires authentication
 */
router.get("/my-organization", authenticate, getMyOrganizationHandler);

export default router;
