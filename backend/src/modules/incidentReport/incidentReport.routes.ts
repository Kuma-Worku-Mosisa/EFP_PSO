// filepath: backend/src/modules/incidentReport/incidentReport.routes.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { Router, Request } from "express";
import { IncidentReportController } from "./incidentReport.controller";
import { authenticate } from "../../middleware/auth";
import { buildPrefixedFilename } from "../../middleware/fileUpload";

const router = Router();
const controller = new IncidentReportController();

const INCIDENT_REPORT_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "incident-reports",
);

const ensureIncidentReportUploadDir = () => {
  if (!fs.existsSync(INCIDENT_REPORT_UPLOAD_DIR)) {
    fs.mkdirSync(INCIDENT_REPORT_UPLOAD_DIR, { recursive: true });
  }
};

const createIncidentReportUploader = () => {
  ensureIncidentReportUploadDir();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(INCIDENT_REPORT_UPLOAD_DIR, "files");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename(file.fieldname, file.originalname));
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.fieldname === "signature") {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Signature must be an image file."));
        }
      }
      if (file.fieldname === "report") {
        if (file.mimetype !== "application/pdf") {
          return cb(new Error("Report must be a PDF file."));
        }
      }
      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
};

const incidentReportUploader = createIncidentReportUploader();
const incidentReportUploadHandler = incidentReportUploader.fields([
  { name: "signature", maxCount: 1 },
  { name: "report", maxCount: 1 },
]);

// Create application report route definitions mapping down to clean middleware pipelines
router.post("/", authenticate, (req, res, next) => {
  incidentReportUploadHandler(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to process uploaded files.",
      });
    }
    controller.createReport(req as Request, res, next);
  });
});
router.get("/", authenticate, (req, res, next) =>
  controller.getReports(req, res, next),
);
router.patch("/:id/efp-sign", authenticate, (req, res, next) =>
  controller.efpOfficerSignOff(req as Request<{ id: string }>, res, next),
);
router.patch("/:id/superior-feedback", authenticate, (req, res, next) =>
  controller.submitSuperiorFeedback(req as Request<{ id: string }>, res, next),
);

export default router;
