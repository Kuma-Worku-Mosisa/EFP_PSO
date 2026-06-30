import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  createInspection,
  finalizeInspection,
  getInspection,
  getInspectionSummary,
  listInspections,
  updateInspection,
  confirmFinalReport,
  uploadLeadSignature,
  uploadCommitteeSignature,
  deleteCommitteeSignature,
  submitFieldReview,
} from "./inspection.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "super_admin"]),
  listInspections,
);

router.post(
  "/",
  authenticate,
  authorize(["admin", "super_admin"]),
  createInspection,
);

router.get(
  "/summary",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "super_admin"]),
  getInspectionSummary,
);

router.get(
  "/:id",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "super_admin"]),
  getInspection,
);

router.patch(
  "/:id",
  authenticate,
  authorize(["admin", "super_admin"]),
  updateInspection,
);

router.patch(
  "/:id/field-review",
  authenticate,
  authorize(["FIELD_REVIEWER"]),
  submitFieldReview,
);

router.post(
  "/:id/finalize",
  authenticate,
  authorize(["admin", "super_admin"]),
  finalizeInspection,
);

router.post(
  "/:id/final-report",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "super_admin"]),
  confirmFinalReport,
);

router.post(
  "/:id/committee/:committeeId/signature",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "super_admin"]),
  uploadCommitteeSignature,
);

router.delete(
  "/:id/committee/:committeeId/signature",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "super_admin"]),
  deleteCommitteeSignature,
);

router.post(
  "/:id/lead-signature",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "super_admin"]),
  uploadLeadSignature,
);

export default router;
