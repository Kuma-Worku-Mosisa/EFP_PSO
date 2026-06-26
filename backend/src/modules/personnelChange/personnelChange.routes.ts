import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  getPersonnelChangeRequests,
  createPersonnelChangeRequest,
  approvePersonnelChangeRequest,
  rejectPersonnelChangeRequest,
  verifyPersonnelChangeDocument,
  unverifyPersonnelChangeDocument,
} from "./personnelChange.controller";

const router = Router();

// Get all personnel change requests
router.get(
  "/",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  getPersonnelChangeRequests,
);

// Create personnel change request (supports NEW_EMPLOYEE flow)
router.post(
  "/",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  createPersonnelChangeRequest,
);

// Approve a personnel change request only after employee documents are verified
router.post(
  "/:id/approve",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  approvePersonnelChangeRequest,
);

// Reject a personnel change request
router.post(
  "/:id/reject",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  rejectPersonnelChangeRequest,
);

// Verify an employee document linked to a personnel change request
router.post(
  "/:requestId/documents/:documentId/verify",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  verifyPersonnelChangeDocument,
);

router.post(
  "/:requestId/documents/:documentId/unverify",
  authenticate,
  authorize(["org_hr_manager", "admin", "system_admin", "super_admin"]),
  unverifyPersonnelChangeDocument,
);

export default router;
