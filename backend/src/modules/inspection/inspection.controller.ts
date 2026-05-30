import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { ApiResponse } from "../../utils/apiResponse";
import { InspectionService } from "./inspection.service";
import { buildPrefixedFilename } from "../../middleware/fileUpload";

const isAdmin = (req: Request) => {
  const roles = (req.user?.roles || []).map((role) =>
    String(role).toLowerCase(),
  );
  return roles.some((role) => role === "admin" || role === "system_admin");
};

const createSignatureUploadMiddleware = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const inspectionId = String(
        req.params.id || req.params.inspectionId || "",
      );
      const committeeId = String(req.params.committeeId || "");
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "inspection-signatures",
        inspectionId,
        committeeId,
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename("signature", file.originalname));
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Signature must be an image file."));
      }
      return cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }).single("signature");
};

const createReportUploadMiddleware = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const inspectionId = String(req.params.id || req.params.inspectionId || "");
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "inspection-reports",
        inspectionId,
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename("final-report", file.originalname));
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Final report must be a PDF file."));
      }
      return cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }).single("report");
};

export async function listInspections(req: Request, res: Response) {
  try {
    const inspections = await InspectionService.listInspections(
      req.user?.roles || [],
      Number(req.user?.userId ?? req.user?.id),
    );

    return ApiResponse.success(res, "Inspections fetched", inspections);
  } catch (error: any) {
    console.error("[ERROR] listInspections failed:", error?.message || error);
    return ApiResponse.error(
      res,
      "Failed to fetch inspections.",
      500,
      error?.message,
    );
  }
}

export async function createInspection(req: Request, res: Response) {
  try {
    if (!isAdmin(req)) {
      return ApiResponse.error(res, "Admin access required.", 403);
    }

    const applicationId = Number(req.body?.applicationId);
    const leadInspectorId = req.body?.leadInspectorId
      ? Number(req.body.leadInspectorId)
      : null;
    const committeeMemberIds = Array.isArray(req.body?.committeeMemberIds)
      ? req.body.committeeMemberIds
          .map((value: any) => Number(value))
          .filter((value: number) => Number.isFinite(value) && value > 0)
      : [];
    const scheduledDate = new Date(String(req.body?.scheduledDate || ""));

    if (!Number.isFinite(applicationId) || applicationId <= 0) {
      return ApiResponse.error(res, "Valid applicationId is required.", 400);
    }

    if (Number.isNaN(scheduledDate.getTime())) {
      return ApiResponse.error(res, "Valid scheduledDate is required.", 400);
    }

    const inspection = await InspectionService.createInspection({
      applicationId,
      leadInspectorId,
      scheduledDate,
      createdByUserId: Number(req.user?.userId ?? req.user?.id),
      committeeMemberIds,
    });

    return ApiResponse.success(res, "Inspection scheduled.", inspection, 201);
  } catch (error: any) {
    console.error("[ERROR] createInspection failed:", error?.message || error);
    return ApiResponse.error(
      res,
      "Failed to schedule inspection.",
      500,
      error?.message,
    );
  }
}

export async function getInspection(req: Request, res: Response) {
  try {
    const inspectionId = Number(req.params.id);
    if (!Number.isFinite(inspectionId) || inspectionId <= 0) {
      return ApiResponse.error(res, "Invalid inspection id.", 400);
    }

    const inspection = await InspectionService.getInspectionById(inspectionId);
    if (!inspection) {
      return ApiResponse.error(res, "Inspection not found.", 404);
    }

    const roles = (req.user?.roles || []).map((role) =>
      String(role).toLowerCase(),
    );
    const userId = Number(req.user?.userId ?? req.user?.id);
    const hasAdminAccess = roles.some(
      (role) => role === "admin" || role === "system_admin",
    );
    const isAssignedReviewer = inspection.leadInspectorId === userId;
    const isCommitteeMember = inspection.committeeMembers?.some(
      (member) => Number(member.userId) === userId,
    );

    if (!hasAdminAccess && !isAssignedReviewer && !isCommitteeMember) {
      return ApiResponse.error(res, "Forbidden.", 403);
    }

    return ApiResponse.success(res, "Inspection fetched.", inspection);
  } catch (error: any) {
    console.error("[ERROR] getInspection failed:", error?.message || error);
    return ApiResponse.error(
      res,
      "Failed to fetch inspection.",
      500,
      error?.message,
    );
  }
}

export async function submitFieldReview(req: Request, res: Response) {
  try {
    const inspectionId = Number(req.params.id);
    const userId = Number(req.user?.userId ?? req.user?.id);

    if (!Number.isFinite(inspectionId) || inspectionId <= 0) {
      return ApiResponse.error(res, "Invalid inspection id.", 400);
    }

    const result = await InspectionService.submitFieldReview(
      inspectionId,
      userId,
      {
        isLocationValid: Boolean(req.body?.isLocationValid),
        isInfrastructureValid: Boolean(req.body?.isInfrastructureValid),
        isTrainingValid: Boolean(req.body?.isTrainingValid),
        findingsSummary: req.body?.findingsSummary ?? null,
        expertOpinion: req.body?.expertOpinion ?? null,
      },
    );

    return ApiResponse.success(res, "Field review saved.", result);
  } catch (error: any) {
    console.error("[ERROR] submitFieldReview failed:", error?.message || error);
    return ApiResponse.error(
      res,
      error?.message || "Failed to save field review.",
      500,
      error?.message,
    );
  }
}

export async function finalizeInspection(req: Request, res: Response) {
  try {
    if (!isAdmin(req)) {
      return ApiResponse.error(res, "Admin access required.", 403);
    }

    const inspectionId = Number(req.params.id);
    const decision = String(req.body?.decision || "").toUpperCase();
    const remarks =
      String(req.body?.remarks || "").trim() || "Final review completed.";

    if (!Number.isFinite(inspectionId) || inspectionId <= 0) {
      return ApiResponse.error(res, "Invalid inspection id.", 400);
    }

    if (!["APPROVE", "REJECT", "CORRECTION_REQUESTED"].includes(decision)) {
      return ApiResponse.error(
        res,
        "decision must be APPROVE, REJECT, or CORRECTION_REQUESTED.",
        400,
      );
    }

    const result = await InspectionService.finalizeInspection(
      inspectionId,
      Number(req.user?.userId ?? req.user?.id),
      decision as "APPROVE" | "REJECT" | "CORRECTION_REQUESTED",
      remarks,
    );

    return ApiResponse.success(res, "Inspection finalized.", result);
  } catch (error: any) {
    console.error(
      "[ERROR] finalizeInspection failed:",
      error?.message || error,
    );
    return ApiResponse.error(
      res,
      error?.message || "Failed to finalize inspection.",
      500,
      error?.message,
    );
  }
}

export async function uploadCommitteeSignature(req: Request, res: Response) {
  const upload = createSignatureUploadMiddleware();

  upload(req, res, async (uploadError) => {
    try {
      if (uploadError) {
        return ApiResponse.error(
          res,
          uploadError.message || "Failed to upload signature.",
          400,
        );
      }

      const inspectionId = Number(req.params.id);
      const committeeId = Number(req.params.committeeId);
      const userId = Number(req.user?.userId ?? req.user?.id);

      if (!Number.isFinite(inspectionId) || inspectionId <= 0) {
        return ApiResponse.error(res, "Invalid inspection id.", 400);
      }

      if (!Number.isFinite(committeeId) || committeeId <= 0) {
        return ApiResponse.error(res, "Invalid committee member id.", 400);
      }

      if (!req.file) {
        return ApiResponse.error(res, "Signature image is required.", 400);
      }

      const signatureUrl = `/uploads/inspection-signatures/${inspectionId}/${committeeId}/${req.file.filename}`;

      const updatedCommittee = await InspectionService.uploadCommitteeSignature(
        {
          inspectionId,
          committeeId,
          userId,
          isAdmin: isAdmin(req),
          signatureUrl,
        },
      );

      return ApiResponse.success(
        res,
        "Committee signature uploaded.",
        updatedCommittee,
      );
    } catch (error: any) {
      console.error(
        "[ERROR] uploadCommitteeSignature failed:",
        error?.message || error,
      );
      const message = error?.message || "Failed to upload signature.";
      const statusCode = message.includes("own committee signature")
        ? 403
        : message.includes("not found")
          ? 404
          : 500;
      return ApiResponse.error(res, message, statusCode, error?.message);
    }
  });
}

export async function deleteCommitteeSignature(req: Request, res: Response) {
  try {
    const inspectionId = Number(req.params.id);
    const committeeId = Number(req.params.committeeId);
    const userId = Number(req.user?.userId ?? req.user?.id);

    if (!Number.isFinite(inspectionId) || inspectionId <= 0) {
      return ApiResponse.error(res, "Invalid inspection id.", 400);
    }

    if (!Number.isFinite(committeeId) || committeeId <= 0) {
      return ApiResponse.error(res, "Invalid committee member id.", 400);
    }

    const result = await InspectionService.clearCommitteeSignature({
      inspectionId,
      committeeId,
      userId,
      isAdmin: isAdmin(req),
    });

    const priorUrl = (result as { priorSignatureUrl?: string }).priorSignatureUrl;
    if (priorUrl?.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), priorUrl.replace(/^\//, ""));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore file cleanup failure
        }
      }
    }

    const { priorSignatureUrl: _removed, ...committee } = result as {
      priorSignatureUrl?: string;
      [key: string]: unknown;
    };

    return ApiResponse.success(
      res,
      "Committee signature removed.",
      committee,
    );
  } catch (error: any) {
    console.error(
      "[ERROR] deleteCommitteeSignature failed:",
      error?.message || error,
    );
    const message = error?.message || "Failed to remove signature.";
    const statusCode = message.includes("own committee signature")
      ? 403
      : message.includes("not found")
        ? 404
        : 500;
    return ApiResponse.error(res, message, statusCode, error?.message);
  }
}

export async function uploadLeadSignature(req: Request, res: Response) {
  const upload = createSignatureUploadMiddleware();

  // Save to a temporary 'lead' folder first; we'll move the file to the committee id folder after ensuring the committee row.
  req.params.committeeId = "lead";

  upload(req, res, async (uploadError) => {
    try {
      if (uploadError) {
        return ApiResponse.error(
          res,
          uploadError.message || "Failed to upload signature.",
          400,
        );
      }

      const inspectionId = Number(req.params.id);
      const userId = Number(req.user?.userId ?? req.user?.id);

      if (!Number.isFinite(inspectionId) || inspectionId <= 0) {
        return ApiResponse.error(res, "Invalid inspection id.", 400);
      }

      if (!req.file) {
        return ApiResponse.error(res, "Signature image is required.", 400);
      }

      // Ensure a committee row exists for this lead inspector (creates one if needed)
      const committee = await InspectionService.ensureCommitteeRowForUser({
        inspectionId,
        userId,
        expertRole: "Lead Inspector",
      });

      // Move uploaded file from temporary 'lead' folder to the committeeId folder
      const tmpPath = path.join(
        process.cwd(),
        "uploads",
        "inspection-signatures",
        String(inspectionId),
        "lead",
        req.file.filename,
      );

      const targetDir = path.join(
        process.cwd(),
        "uploads",
        "inspection-signatures",
        String(inspectionId),
        String(committee.id),
      );

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetPath = path.join(targetDir, req.file.filename);
      fs.renameSync(tmpPath, targetPath);

      const signatureUrl = `/uploads/inspection-signatures/${inspectionId}/${committee.id}/${req.file.filename}`;

      const updatedCommittee = await InspectionService.uploadCommitteeSignature(
        {
          inspectionId,
          committeeId: committee.id,
          userId,
          isAdmin: isAdmin(req),
          signatureUrl,
        },
      );

      return ApiResponse.success(
        res,
        "Lead inspector signature uploaded.",
        updatedCommittee,
      );
    } catch (error: any) {
      console.error(
        "[ERROR] uploadLeadSignature failed:",
        error?.message || error,
      );
      const message = error?.message || "Failed to upload signature.";
      const statusCode = message.includes("own committee signature")
        ? 403
        : 500;
      return ApiResponse.error(res, message, statusCode, error?.message);
    }
  });
}

export async function confirmFinalReport(req: Request, res: Response) {
  const upload = createReportUploadMiddleware();

  upload(req, res, async (uploadError) => {
    try {
      if (uploadError) {
        return ApiResponse.error(
          res,
          uploadError.message || "Failed to upload report.",
          400,
        );
      }

      const inspectionId = Number(req.params.id);
      const userId = Number(req.user?.userId ?? req.user?.id);

      if (!Number.isFinite(inspectionId) || inspectionId <= 0) {
        return ApiResponse.error(res, "Invalid inspection id.", 400);
      }

      if (!req.file) {
        return ApiResponse.error(res, "Final report PDF is required.", 400);
      }

      const finalReportUrl = `/uploads/inspection-reports/${inspectionId}/${req.file.filename}`;

      const result = await InspectionService.confirmFinalReport({
        inspectionId,
        userId,
        isAdmin: isAdmin(req),
        finalReportUrl,
      });

      return ApiResponse.success(
        res,
        "Final report confirmed.",
        result,
      );
    } catch (error: any) {
      console.error("[ERROR] confirmFinalReport failed:", error?.message || error);

      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore cleanup failure
        }
      }

      const message = error?.message || "Failed to confirm final report.";
      const statusCode =
        message.includes("Only the lead inspector") ? 403 :
        message.includes("must sign first") ? 400 :
        500;

      return ApiResponse.error(res, message, statusCode, error?.message);
    }
  });
}
