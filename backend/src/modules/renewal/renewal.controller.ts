import { Request, Response } from "express";
import multer from "multer";
import {
  createRenewalApplicationSchema,
  validateRenewalEligibilitySchema,
} from "./renewal.validation";
import { RenewalService } from "./renewal.service";
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

export const validateRenewalEligibility = async (
  req: Request,
  res: Response,
) => {
  try {
    const validated = validateRenewalEligibilitySchema.parse(req.body);
    const data = await RenewalService.validateEligibility(
      validated.certificateSerialNumber,
    );

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Failed to validate renewal eligibility",
    });
  }
};

export const createRenewalApplication = async (req: Request, res: Response) => {
  try {
    const validated = createRenewalApplicationSchema.parse(req.body);
    const submittedByUserId = getAuthenticatedUserId(req);
    if (!Number.isFinite(submittedByUserId)) {
      return res.status(401).json({
        success: false,
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Failed to create renewal application",
    });
  }
};

export const uploadRenewalFiles = renewalUploader.any();
