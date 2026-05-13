// filepath: src/routes/application.routes.ts
import { Router, Request, Response } from "express";
import { submitApplication } from "./application.controller";
import { uploadDocuments, getOrganizationDocuments } from "./upload.controller";
import { authenticate } from "../../middleware/auth"; // Ensure this matches your middleware file name
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
router.post(
  "/submit",
  // authenticate, // This populates req.user.id for the controller
  submitApplication,
);

// GET /api/applications - list for admin review
router.get(
  "/",
  /* authenticate, */ (req, res, next) => {
    const { getApplications: handler } = require("./application.controller");
    return handler(req, res, next);
  },
);

/**
 * Approve an application
 * POST /api/applications/:id/approve
 */
router.post(
  "/:id/approve",
  /* authenticate, */ (req, res, next) => {
    // lazy import to avoid circular issues
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
  /* authenticate, */ (req, res, next) => {
    const { rejectApplication } = require("./application.controller");
    return rejectApplication(req, res, next);
  },
);

export default router;
