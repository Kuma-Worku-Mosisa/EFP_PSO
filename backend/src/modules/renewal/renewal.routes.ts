import { Router } from "express";
import {
  createRenewalApplication,
  uploadRenewalFiles,
  validateRenewalEligibility,
} from "./renewal.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/validate", validateRenewalEligibility);
router.post("/", authenticate, uploadRenewalFiles, createRenewalApplication);

export default router;
