// filepath: backend/src/modules/incidentReport/incidentReport.routes.ts
import { Router, Request } from "express";
import { IncidentReportController } from "./incidentReport.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
const controller = new IncidentReportController();

// Create application report route definitions mapping down to clean middleware pipelines
router.post("/", authenticate, (req, res, next) =>
  controller.createReport(req, res, next),
);
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
