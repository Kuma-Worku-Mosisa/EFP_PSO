import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { FormalRequestService } from "./formalRequest.service";
import { NotificationService } from "../notification/notification.service";

const getUserId = (req: Request) => {
  const authUserId = (req as any).user?.id;
  if (authUserId) return Number(authUserId);
  if (req.body?.userId) return Number(req.body.userId);
  if (req.params?.userId) return Number(req.params.userId);
  return null;
};

export const listFormalRequests = async (req: Request, res: Response) => {
  try {
    const rows = await FormalRequestService.listFormalRequests();
    return ApiResponse.success(res, "Formal requests fetched", rows);
  } catch (error: any) {
    console.error("[ERROR] Formal requests list failed:", error?.message);
    return ApiResponse.error(
      res,
      "Failed to fetch formal requests",
      500,
      error?.message,
    );
  }
};

export const getFormalRequestByUser = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return ApiResponse.error(res, "userId is required", 400);
  }

  try {
    const request = await FormalRequestService.getByUserId(userId);
    if (!request) {
      return ApiResponse.error(res, "Formal request not found", 404);
    }
    return ApiResponse.success(res, "Formal request fetched", request);
  } catch (error: any) {
    console.error("[ERROR] Formal request fetch failed:", error?.message);
    return ApiResponse.error(
      res,
      "Failed to fetch formal request",
      500,
      error?.message,
    );
  }
};

export const listFormalRequestsByUser = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return ApiResponse.error(res, "userId is required", 400);
  }

  try {
    const rows = await FormalRequestService.listByUserId(userId);
    return ApiResponse.success(res, "Formal requests fetched", rows);
  } catch (error: any) {
    console.error("[ERROR] Formal request list failed:", error?.message);
    return ApiResponse.error(
      res,
      "Failed to fetch formal requests",
      500,
      error?.message,
    );
  }
};

export const createFormalRequest = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const requestLetterUrl = String(req.body?.requestLetterUrl || "").trim();

  if (!userId) {
    return ApiResponse.error(res, "userId is required", 400);
  }

  if (!requestLetterUrl) {
    return ApiResponse.error(res, "requestLetterUrl is required", 400);
  }

  try {
    const result = await FormalRequestService.createOrUpdateRequest(
      userId,
      requestLetterUrl,
      (req as any).user?.id,
    );

    // Notify admins/super_admins about the new formal request
    try {
      const userFullName =
        (req as any).user?.fullName || (req as any).user?.username || "User";
      await NotificationService.notifyAdminsOnFormalRequestSubmission(
        userFullName,
        userId,
      );
    } catch (notificationError) {
      console.warn(
        "[WARN] Failed to send admin notification for formal request:",
        notificationError,
      );
      // Don't throw - notification failure shouldn't block the request creation
    }

    return ApiResponse.success(res, "Formal request saved", result, 201);
  } catch (error: any) {
    console.error("[ERROR] Formal request create failed:", error?.message);
    return ApiResponse.error(
      res,
      "Failed to save formal request",
      500,
      error?.message,
    );
  }
};

export const approveFormalRequest = async (req: Request, res: Response) => {
  const requestId = Number(req.params.id);
  const { adminFeedback } = req.body || {};

  try {
    const result = await FormalRequestService.updateStatus(
      requestId,
      "APPROVED",
      adminFeedback ?? null,
      (req as any).user?.id,
    );

    if (!result) {
      return ApiResponse.error(res, "Formal request not found", 404);
    }

    return ApiResponse.success(res, "Formal request approved", result);
  } catch (error: any) {
    console.error("[ERROR] Formal request approve failed:", error?.message);
    return ApiResponse.error(
      res,
      "Failed to approve formal request",
      500,
      error?.message,
    );
  }
};

export const rejectFormalRequest = async (req: Request, res: Response) => {
  const requestId = Number(req.params.id);
  const { adminFeedback } = req.body || {};

  try {
    const result = await FormalRequestService.updateStatus(
      requestId,
      "REJECTED",
      adminFeedback ?? null,
      (req as any).user?.id,
    );

    if (!result) {
      return ApiResponse.error(res, "Formal request not found", 404);
    }

    return ApiResponse.success(res, "Formal request rejected", result);
  } catch (error: any) {
    console.error("[ERROR] Formal request reject failed:", error?.message);
    return ApiResponse.error(
      res,
      "Failed to reject formal request",
      500,
      error?.message,
    );
  }
};

export const updateFormalRequestFeedback = async (
  req: Request,
  res: Response,
) => {
  const requestId = Number(req.params.id);
  const adminFeedback = String(req.body?.adminFeedback || "").trim();

  if (!adminFeedback) {
    return ApiResponse.error(res, "adminFeedback is required", 400);
  }

  try {
    const result = await FormalRequestService.updateFeedback(
      requestId,
      adminFeedback,
      (req as any).user?.id,
    );

    if (!result) {
      return ApiResponse.error(res, "Formal request not found", 404);
    }

    return ApiResponse.success(res, "Feedback updated", result);
  } catch (error: any) {
    console.error("[ERROR] Formal request feedback failed:", error?.message);
    return ApiResponse.error(
      res,
      "Failed to update feedback",
      500,
      error?.message,
    );
  }
};
