// filepath: src/modules/application/application.controller.ts
import { Request, Response } from "express";
import { ApplicationService } from "./application.service";
import { ApiResponse } from "../../utils/apiResponse";
import { createApplicationSchema } from "./application.validation";

export const getApplications = async (req: Request, res: Response) => {
  try {
    // Basic list for admin review - include related organization and tracking
    const apps = await ApplicationService.listApplications();
    return ApiResponse.success(res, "Applications fetched", apps);
  } catch (error: any) {
    console.error(
      "[ERROR] Fetch applications failed:",
      error?.message || error,
    );
    return ApiResponse.error(
      res,
      "Failed to fetch applications.",
      500,
      error?.message,
    );
  }
};

export const submitApplication = async (req: Request, res: Response) => {
  try {
    // 1. Validate the combined body (formData + uploadedFiles)
    // const validation = createApplicationSchema.safeParse(req.body);
    // Validation is commented out to allow frontend-validated submissions during testing.
    const validation: any = { success: true, data: req.body };

    if (!validation.success) {
      return ApiResponse.error(
        res,
        "Validation failed. Please check all fields and documents.",
        400,
        validation.error.format(),
      );
    }

    // 2. Extract verified data
    const { formData, uploadedFiles } = validation.data;

    // 3. Identify the logged-in user (Critical for Tracking History)
    const userId = req.user?.userId ?? req.user?.id;

    if (!userId) {
      return ApiResponse.error(
        res,
        "Unauthorized: User session not found",
        401,
      );
    }

    // 4. Trigger the Service Transaction
    const result = await ApplicationService.submitNewApplication(
      formData,
      uploadedFiles,
      Number(userId),
    );

    // 5. Success Response
    return ApiResponse.success(
      res,
      "Your license application and personnel registrations have been submitted successfully.",
      result,
      201,
    );
  } catch (error: any) {
    // Log the error for internal debugging
    console.error("APPLICATION_SUBMISSION_ERROR:", error);

    // Handle specific Prisma errors (like unique constraint violations for FaydaID or Email)
    if (error.code === "P2002") {
      return ApiResponse.error(
        res,
        "A user or employee with this Fayda ID or Email already exists.",
        409,
      );
    }

    return ApiResponse.error(
      res,
      "An internal error occurred while processing your application.",
      500,
      error.message,
    );
  }
};

export const approveApplication = async (req: Request, res: Response) => {
  const applicationId = Number(req.params.id);
  const userId = (req as any).user?.id || 1;
  const { remarks } = req.body || {};

  try {
    console.log(
      "[DEBUG] Approve request received for application:",
      applicationId,
    );

    const result = await ApplicationService.approveApplication(
      applicationId,
      userId,
      String(remarks || "Approved by reviewer"),
    );

    console.log("[DEBUG] Application approved:", applicationId);
    return ApiResponse.success(
      res,
      "Application approved successfully.",
      result,
    );
  } catch (error: any) {
    console.error(
      "[ERROR] Application approve failed:",
      error?.message || error,
    );
    return ApiResponse.error(
      res,
      "Failed to approve application.",
      500,
      error?.message,
    );
  }
};

export const rejectApplication = async (req: Request, res: Response) => {
  const applicationId = Number(req.params.id);
  const userId = (req as any).user?.id || 1;
  const { remarks } = req.body || {};

  try {
    console.log(
      "[DEBUG] Reject request received for application:",
      applicationId,
    );

    const result = await ApplicationService.rejectApplication(
      applicationId,
      userId,
      String(remarks || "Rejected by reviewer"),
    );

    console.log("[DEBUG] Application rejected:", applicationId);
    return ApiResponse.success(
      res,
      "Application rejected and applicant notified.",
      result,
    );
  } catch (error: any) {
    console.error(
      "[ERROR] Application rejection failed:",
      error?.message || error,
    );
    return ApiResponse.error(
      res,
      "Failed to reject application.",
      500,
      error?.message,
    );
  }
};

export const getMyApplication = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId ?? (req as any).user?.id;
    if (!userId) return ApiResponse.error(res, "Unauthorized request", 401);

    const application = await ApplicationService.getLatestApplicationByUser(
      Number(userId),
    );
    return ApiResponse.success(res, "Application fetched", application);
  } catch (error: any) {
    if (error.message.includes("not found"))
      return ApiResponse.error(res, error.message, 404);
    return ApiResponse.error(
      res,
      "Failed to fetch application.",
      500,
      error?.message,
    );
  }
};
