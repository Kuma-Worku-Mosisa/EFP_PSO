import { Request, Response } from "express";
import multer from "multer";
import {
  createRenewalApplicationSchema,
  validateRenewalEligibilitySchema,
} from "./renewal.validation";
import { RenewalService } from "./renewal.service";
import { isRenewalValidationError } from "./renewal.errors";
import { fileFilter } from "../../middleware/fileUpload";

const getAuthenticatedUserId = (req: Request) => {
  const requester = (req as any).user;
  return Number(requester?.userId ?? requester?.id ?? NaN);
};

const renewalUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleRenewalError = (res: Response, error: unknown, fallback: string) => {
  if (isRenewalValidationError(error)) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: error instanceof Error ? error.message : fallback,
  });
};

export const validateRenewalEligibility = async (
  req: Request,
  res: Response,
) => {
  try {
    const validated = validateRenewalEligibilitySchema.parse(req.body);
    const userId = getAuthenticatedUserId(req);

    const data = await RenewalService.validateEligibility(
      validated.certificateSerialNumber,
      userId,
    );

    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleRenewalError(
      res,
      error,
      "Failed to validate renewal eligibility",
    );
  }
};

export const createRenewalApplication = async (req: Request, res: Response) => {
  try {
    const validated = createRenewalApplicationSchema.parse(req.body);
    const submittedByUserId = getAuthenticatedUserId(req);
    if (!Number.isFinite(submittedByUserId)) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
      });
    }
    const rawFiles = (req.files || []) as Express.Multer.File[];
    const uploadedFiles = rawFiles.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
    }));

    const data = await RenewalService.submitRenewal({
      certificateSerialNumber: validated.certificateSerialNumber,
      renewalYear: validated.renewalYear,
      payload: validated.payload ?? "{}",
      submittedByUserId,
      files: uploadedFiles,
    });

    return res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    return handleRenewalError(
      res,
      error,
      "Failed to create renewal application",
    );
  }
};

export const uploadRenewalFiles = renewalUploader.any();
