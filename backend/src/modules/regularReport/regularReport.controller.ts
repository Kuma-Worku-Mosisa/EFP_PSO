import { Request, Response, NextFunction } from "express";
import { RegularReportService } from "./regularReport.service";
import { ApiResponse } from "../../utils/apiResponse";
import path from "path";
import { getDocumentUrl } from "../../utils/documentOrganizer";

const service = new RegularReportService();

const buildUploadedUrl = (file?: Express.Multer.File | null) => {
  if (!file) return null;

  const relativePath = path
    .relative(process.cwd(), file.path)
    .replace(/\\/g, "/");
  return getDocumentUrl(relativePath);
};

export class RegularReportController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;
      const organizationId = Number(
        req.body.organizationId || currentUser?.organizationId,
      );
      const files = (req as any).files || {};
      const reportFile = files?.report ? files.report[0] : (req as any).file;
      const reporterSignatureFile = files?.reporterSignature
        ? files.reporterSignature[0]
        : null;

      if (!organizationId) {
        return ApiResponse.error(res, "Organization is required", 400);
      }

      let reportFileUrl = "";
      if (reportFile) {
        reportFileUrl = buildUploadedUrl(reportFile) || "";
      }

      let reporterSignatureUrl = req.body.reporterSignatureUrl || null;
      if (reporterSignatureFile) {
        reporterSignatureUrl = buildUploadedUrl(reporterSignatureFile);
      }

      const report = await service.createReport({
        ...req.body,
        organizationId,
        userId: currentUser?.id || currentUser?.userId || null,
        reportFileUrl,
        reporterSignatureUrl,
      });

      return ApiResponse.success(
        res,
        "Institution report submitted successfully",
        report,
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const reportId = Number(req.params.id);
      const reviewType = String(req.body.reviewType || "").toLowerCase();
      const files = (req as any).files || {};
      const officerSignatureFile = files?.efpOfficerSignature?.[0] || null;
      const superiorSignatureFile = files?.superiorSignature?.[0] || null;

      if (!reportId) {
        return ApiResponse.error(res, "Report ID is required", 400);
      }

      if (!["officer", "superior"].includes(reviewType)) {
        return ApiResponse.error(
          res,
          "Review type must be officer or superior",
          400,
        );
      }

      const updatePayload = {
        ...req.body,
        efpOfficerSignatureUrl: req.body.efpOfficerSignatureUrl || null,
        superiorSignatureUrl: req.body.superiorSignatureUrl || null,
      };

      if (officerSignatureFile) {
        updatePayload.efpOfficerSignatureUrl =
          buildUploadedUrl(officerSignatureFile);
      }

      if (superiorSignatureFile) {
        updatePayload.superiorSignatureUrl = buildUploadedUrl(
          superiorSignatureFile,
        );
      }

      const report = await service.updateReview(
        reportId,
        reviewType,
        updatePayload,
      );

      return ApiResponse.success(
        res,
        `${reviewType === "officer" ? "Officer" : "Superior"} review updated successfully`,
        report,
        200,
      );
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.query.organizationId
        ? Number(req.query.organizationId)
        : undefined;
      const reports = await service.listReports(organizationId);
      return ApiResponse.success(
        res,
        "Institution reports retrieved",
        reports,
        200,
      );
    } catch (error) {
      next(error);
    }
  }
}
