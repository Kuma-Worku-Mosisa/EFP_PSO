import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  getOrganizationsHandler,
  getOrganizationDetailsHandler,
  getAddressChangeRequestsHandler,
  createAddressChangeRequestHandler,
  updateOrganizationHandler,
  deleteOrganizationDocumentHandler,
  replaceOrganizationDocumentHandler,
} from "./organization.controller";
import { processAddressChangeRequestHandler } from "./address-request.controller";

const router = Router();

// Public: list organizations for admin dashboard
router.get("/", getOrganizationsHandler);

// Organization address change requests
router.post(
  "/address-change-requests",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  createAddressChangeRequestHandler,
);

// List address change requests for the authenticated user's organization
router.get(
  "/address-change-requests",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  getAddressChangeRequestsHandler,
);

router.patch(
  "/address-change-requests/:requestId",
  authenticate,
  authorize(["admin", "system_admin", "super_admin"]),
  processAddressChangeRequestHandler,
);

// Public: get detailed organization data (employees, incidents, contracts, etc.)
// Backwards-compatible: allow both `/api/organizations/:id` and `/api/organizations/:id/details`
router.get("/:id", getOrganizationDetailsHandler);
router.get("/:id/details", getOrganizationDetailsHandler);

// Update organization status / registered date
router.patch("/:id", updateOrganizationHandler);

// Delete organization document
router.delete("/documents/:docId", deleteOrganizationDocumentHandler);

// Replace organization document
router.patch("/documents/:docId", replaceOrganizationDocumentHandler);

export default router;
