import { Request, Response, NextFunction } from "express";
import { RegularReportService } from "./regularReport.service";
import { ApiResponse } from "../../utils/apiResponse";
import path from "path";
import { getDocumentUrl } from "../../utils/documentOrganizer";

const service = new RegularReportService();

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
        const relativePath = path
          .relative(process.cwd(), reportFile.path)
          .replace(/\\/g, "/");
        reportFileUrl = getDocumentUrl(relativePath);
      }

      let reporterSignatureUrl = req.body.reporterSignatureUrl || null;
      if (reporterSignatureFile) {
        const relativeSig = path
          .relative(process.cwd(), reporterSignatureFile.path)
          .replace(/\\/g, "/");
        reporterSignatureUrl = getDocumentUrl(relativeSig);
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
