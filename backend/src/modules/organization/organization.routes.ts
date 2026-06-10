import { Router } from "express";
import {
  getOrganizationsHandler,
  getOrganizationDetailsHandler,
  updateOrganizationHandler,
} from "./organization.controller";

const router = Router();

// Public: list organizations for admin dashboard
router.get("/", getOrganizationsHandler);

// Public: get detailed organization data (employees, incidents, contracts, etc.)
router.get("/:id/details", getOrganizationDetailsHandler);

// Update organization status / registered date
router.patch("/:id", updateOrganizationHandler);

export default router;
