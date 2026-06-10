// filepath: backend/src/modules/certification/certification.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  createCertification,
  getCertification,
  listCertifications,
  listPendingStampCertificates,
  listStampedCertificates,
  stampCertification,
  updateCertification,
  revokeCertification,
  signCertification,
  signCertificationWithOfficial,
  getCurrentOfficial,
  verifyCertification,
  uploadApplicantPhoto,
} from "./certification.controller";

const router = Router();

router.post("/", createCertification); // Issue new
router.get("/", authenticate, listCertifications); // Admin List or owner-only list
router.get("/verify/:serial", verifyCertification); // Public verify by serial (QR scanner)
router.get("/pending-stamps", authenticate, listPendingStampCertificates); // Licensing Authority pending stamp certificates (signed, not yet stamped)
router.get("/stamped-certificates", authenticate, listStampedCertificates); // Licensing Authority stamped certificates (already stamped)
router.get("/current-official", authenticate, getCurrentOfficial); // Fetch current logged-in official record if available
router.get("/:id", authenticate, getCertification); // View single (Print view) - applicant-only
router.post("/:id/photo", authenticate, uploadApplicantPhoto); // Upload applicant photo file
router.post("/:id/sign", authenticate, signCertification); // Sign certificate by authorized official
router.post("/:id/stamp", authenticate, stampCertification); // Stamp certificate after it has been signed
router.post(
  "/:id/sign-with-official",
  authenticate,
  signCertificationWithOfficial,
); // Sign by uploading signature + official details
router.patch("/:id", authenticate, updateCertification); // Update editable fields
router.delete("/:id", revokeCertification); // Revoke

export default router;
