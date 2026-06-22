// filepath: src/routes/application.routes.ts
import { Router, Request, Response } from "express";
import {
  submitApplication,
  getMyApplication,
  verifyDocument,
  unverifyDocument,
  getApplicationTrackingHistory,
} from "./application.controller";
import { uploadDocuments, getOrganizationDocuments } from "./upload.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { getApplications } from "./application.controller";
import { createOrganizationDocumentsUploader } from "../../middleware/fileUpload";

const router = Router();

/**
 * @route   POST /api/applications/upload
 * @desc    Upload documents for an organization
 * @desc    Expected form fields: organizationName and files with names like {role}_{documentType}
 * @access  Public (will add authentication later)
 *
 * Example:
 * POST /api/applications/upload
 * FormData:
 *   - organizationName: "My Agency"
 *   - manager_education_doc: <file>
 *   - manager_medical_doc: <file>
 *   - operations_education_doc: <file>
 */
router.post("/upload", (req: Request, res: Response, next) => {
  const uploader = createOrganizationDocumentsUploader();

  uploader.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    uploadDocuments(req, res);
  });
});

/**
 * @route   POST /api/applications/submit
 * @desc    Submit a new license application including organization, resources, and personnel
 * @access  Private (Requires valid User Token)
 */
router.post("/submit", authenticate, submitApplication);

// GET /api/applications/me - logged-in user's latest application
router.get("/me", authenticate, getMyApplication);

// GET /api/applications/:id/history - tracking history for an application
router.get("/:id/history", getApplicationTrackingHistory);

// GET /api/applications - list for admin review
router.get(
  "/",
  authenticate,
  authorize(["admin", "super_admin"]),
  getApplications,
);

/**
 * Approve an application
 * POST /api/applications/:id/approve
 */
router.post(
  "/:id/approve",
  authenticate,
  authorize(["admin", "super_admin"]),
  (req, res, next) => {
    const { approveApplication } = require("./application.controller");
    return approveApplication(req, res, next);
  },
);

/**
 * Reject an application
 * POST /api/applications/:id/reject
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize(["admin", "super_admin"]),
  (req, res, next) => {
    const { rejectApplication } = require("./application.controller");
    return rejectApplication(req, res, next);
  },
);

/**
 * Request correction for an application (send back for applicant fixes)
 * POST /api/applications/:id/correction
 */
router.post(
  "/:id/correction",
  authenticate,
  authorize(["admin", "super_admin"]),
  (req, res, next) => {
    const { requestCorrection } = require("./application.controller");
    return requestCorrection(req, res, next);
  },
);

/**
 * Mark application as under review
 * POST /api/applications/:id/under-review
 */
router.post(
  "/:id/under-review",
  authenticate,
  authorize(["admin", "super_admin"]),
  (req, res, next) => {
    const { markUnderReview } = require("./application.controller");
    return markUnderReview(req, res, next);
  },
);

/**
 * Verify a document before approval
 * POST /api/applications/documents/:scope/:id/verify
 */
router.post("/documents/:scope/:id/verify", verifyDocument);

/**
 * Mark a verified document back for correction
 * POST /api/applications/documents/:scope/:id/unverify
 */
router.post("/documents/:scope/:id/unverify", unverifyDocument);

export default router;
