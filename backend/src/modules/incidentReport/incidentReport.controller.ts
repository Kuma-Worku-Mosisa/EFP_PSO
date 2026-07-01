// filepath: backend/src/modules/incidentReport/incidentReport.controller.ts
import path from "path";
import { Request, Response, NextFunction } from "express";
import { IncidentReportService } from "./incidentReport.service";
import { getDocumentUrl } from "../../utils/documentOrganizer";
import { NotificationService } from "../notification/notification.service";

const reportService = new IncidentReportService();

export class IncidentReportController {
  async createReport(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Securely extract properties set by your authentication middleware layer
      const userOrganizationId = (req as any).user?.organizationId;
      const currentUserId = (req as any).user?.id || null;

      if (!userOrganizationId) {
        res.status(401).json({
          error: "Unauthorized",
          message:
            "No active private security organization linked to this authenticated session.",
        });
        return;
      }

      const files = (req as any).files as
        | {
            signature?: Express.Multer.File[];
            report?: Express.Multer.File[];
          }
        | undefined;
      const signatureFile = files?.signature?.[0];

      const fileNumber = req.body.fileNumber || req.body.recordNumber;
      const reportDate = req.body.reportDate || req.body.date;
      const serviceReceiverName =
        req.body.serviceReceiverName ||
        req.body.stolenServiceUser ||
        req.body.institutionName;
      const crimeType = req.body.crimeType || req.body.criminalActionType;
      const damageDescription =
        req.body.damageDescription || req.body.damageType || "";
      const incidentStartTimestamp =
        req.body.incidentStartTimestamp ||
        (req.body.incidentDate && req.body.incidentTime
          ? `${req.body.incidentDate}T${req.body.incidentTime}`
          : undefined);
      const acceptedLegalResponsibility =
        req.body.acceptedLegalResponsibility === "true" ||
        req.body.acceptedLegalResponsibility === true ||
        Boolean(req.body.agreement);
      const reporterName =
        req.body.reporterName ||
        [
          req.body.reporterFirstName,
          req.body.reporterMiddleName,
          req.body.reporterLastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
      const reporterJobResp =
        req.body.reporterJobResp || req.body.reporterJobResponsibility;
      const reporterTitle = req.body.reporterTitle;
      const reporterSignatureUrl = signatureFile
        ? getDocumentUrl(
            path
              .relative(process.cwd(), signatureFile.path)
              .replace(/\\/g, "/"),
          )
        : req.body.reporterSignatureUrl;
      const securityCustomerOtherBodyCount =
        req.body.securityCustomerOtherBodyCount ??
        req.body.SecurityCustomerOtherBodyCount ??
        req.body.securityCustomerOtherCount ??
        null;
      const explanation = req.body.explanation || req.body.agreement || null;
      const suspects =
        typeof req.body.suspects === "string"
          ? (() => {
              try {
                return JSON.parse(req.body.suspects);
              } catch {
                return [] as any[];
              }
            })()
          : req.body.suspects || [];

      // Schema parameter validations
      if (
        !fileNumber ||
        !reportDate ||
        !serviceReceiverName ||
        !crimeType ||
        !damageDescription ||
        !reporterSignatureUrl ||
        !incidentStartTimestamp
      ) {
        res.status(400).json({
          error: "Bad Request",
          message: "Validation Failed: Mandatory fields cannot be empty.",
        });
        return;
      }

      if (!acceptedLegalResponsibility) {
        res.status(400).json({
          error: "Validation Error",
          message: "Legal declaration acknowledgment is required.",
        });
        return;
      }

      const existingReport = await reportService.findByFileNumber(fileNumber);
      if (existingReport) {
        res.status(409).json({
          error: "Conflict",
          message: `File Number '${fileNumber}' already exists inside the central registry.`,
        });
        return;
      }

      const newReport = await reportService.createReport(
        userOrganizationId,
        currentUserId,
        {
          ...req.body,
          fileNumber,
          reportDate,
          serviceReceiverName,
          crimeType,
          damageDescription,
          incidentStartTimestamp,
          acceptedLegalResponsibility,
          reporterName,
          reporterTitle,
          reporterJobResp,
          reporterSignatureUrl,
          securityCustomerOtherBodyCount,
          explanation,
          actionTakenStatus:
            req.body.actionTakenStatus ||
            req.body.actionStatus ||
            req.body.takenActionStatus ||
            "Submitted",
        },
        suspects,
      );

      await NotificationService.notifyAdminsOnCriminalReportSubmission(
        fileNumber,
        req.body.institutionName ||
          serviceReceiverName ||
          "Unknown organization",
        reporterName || "HR Manager",
      );

      res.status(201).json({
        message: "Incident report logged and securely saved.",
        data: newReport,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReports(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const organizationId = req.query.organizationId
        ? parseInt(req.query.organizationId as string)
        : undefined;

      const { reports, totalCount } = await reportService.getPaginatedReports(
        { orgId: organizationId, search },
        page,
        limit,
      );

      res.status(200).json({
        data: reports,
        meta: {
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async efpOfficerSignOff(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { efpOfficerName, efpOfficerSignatureUrl } = req.body;

      if (!efpOfficerName || !efpOfficerSignatureUrl) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Officer name and digital signature asset links are required.",
        });
        return;
      }

      const updatedReport = await reportService.updateEfpSignOff(
        parseInt(id),
        req.body,
      );
      res.status(200).json({
        message: "Federal Police intake signature locked successfully.",
        data: updatedReport,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitSuperiorFeedback(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { superiorFeedback, superiorSignatureUrl } = req.body;

      if (!superiorFeedback || !superiorSignatureUrl) {
        res.status(400).json({
          error: "Bad Request",
          message: "Directive description and signature are required.",
        });
        return;
      }

      const updatedReport = await reportService.updateSuperiorDirective(
        parseInt(id),
        req.body,
      );
      res.status(200).json({
        message: "Command directive appended to legal chain-of-custody.",
        data: updatedReport,
      });
    } catch (error) {
      next(error);
    }
  }
}
