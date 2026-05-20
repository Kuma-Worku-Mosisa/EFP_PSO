// filepath: backend/src/modules/certification/certification.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  createCertification,
  getCertification,
  listCertifications,
  updateCertification,
  revokeCertification,
  verifyCertification,
} from "./certification.controller";

const router = Router();

router.post("/", createCertification); // Issue new
router.get("/", authenticate, listCertifications); // Admin List or owner-only list
router.get("/verify/:serial", verifyCertification); // Public verify by serial (QR scanner)
router.get("/:id", authenticate, getCertification); // View single (Print view) - applicant-only
router.patch("/:id", authenticate, updateCertification); // Update editable fields
router.delete("/:id", revokeCertification); // Revoke

export default router;
