import { Router } from "express";
import {
  getOrganizationsHandler,
  getOrganizationDetailsHandler,
  updateOrganizationHandler,
  deleteOrganizationDocumentHandler,
  replaceOrganizationDocumentHandler,
} from "./organization.controller";

const router = Router();

// Public: list organizations for admin dashboard
router.get("/", getOrganizationsHandler);

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
