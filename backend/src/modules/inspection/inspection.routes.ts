import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  createInspection,
  finalizeInspection,
  getInspection,
  listInspections,
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
  authorize(["FIELD_REVIEWER", "admin", "system_admin"]),
  listInspections,
);

router.post(
  "/",
  authenticate,
  authorize(["admin", "system_admin"]),
  createInspection,
);

router.get(
  "/:id",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "system_admin"]),
  getInspection,
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
  authorize(["admin", "system_admin"]),
  finalizeInspection,
);

router.post(
  "/:id/final-report",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "system_admin"]),
  confirmFinalReport,
);

router.post(
  "/:id/committee/:committeeId/signature",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "system_admin"]),
  uploadCommitteeSignature,
);

router.delete(
  "/:id/committee/:committeeId/signature",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "system_admin"]),
  deleteCommitteeSignature,
);

router.post(
  "/:id/lead-signature",
  authenticate,
  authorize(["FIELD_REVIEWER", "admin", "system_admin"]),
  uploadLeadSignature,
);

export default router;
