// filepath: src/modules/notification/notification.controller.ts
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { NotificationService } from "./notification.service";
import { NotificationType } from "./notification.types";

function getAuthUserId(req: Request): number | null {
  const id = req.user?.userId ?? req.user?.id;
  return id != null && !Number.isNaN(Number(id)) ? Number(id) : null;
}

function parsePositiveInteger(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

export class NotificationController {
  /**
   * Retrieves the dynamic live notification feed array for an authenticated user,
   * sorted cleanly with the newest operational status developments at the top.
   */
  static async getMyFeed(req: Request, res: Response) {
    try {
      const userId = parsePositiveInteger(req.params.userId);
      if (!userId) {
        return ApiResponse.error(
          res,
          "Missing recipient userId reference key.",
          400,
        );
      }

      const authUserId = getAuthUserId(req);
      if (!authUserId || authUserId !== userId) {
        return ApiResponse.error(
          res,
          "You can only view your own notifications.",
          403,
        );
      }

      const activeFeeds =
        await NotificationService.getUserNotifications(userId);

      return ApiResponse.success(
        res,
        "Bilingual notifications pool synchronized successfully.",
        activeFeeds,
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        "Failed to retrieve tracking notification records.",
        500,
        error.message,
      );
    }
  }

  /**
   * Updates an in-app feed card's status flag to mark it as read,
   * removing the unread badge counter visibility in the frontend client dashboard layer.
   */
  static async clearNotification(req: Request, res: Response) {
    try {
      const notificationId = parsePositiveInteger(req.body.notificationId);
      if (!notificationId) {
        return ApiResponse.error(
          res,
          "Notification item index ID parameter is required.",
          400,
        );
      }

      const authUserId = getAuthUserId(req);
      if (!authUserId) {
        return ApiResponse.error(res, "Authentication required.", 401);
      }

      const updatedLog = await NotificationService.markAsRead(
        Number(notificationId),
        authUserId,
      );

      return ApiResponse.success(
        res,
        "Notification flagged as read execution complete.",
        updatedLog,
      );
    } catch (error: any) {
      const status =
        error.message === "Notification not found or access denied."
          ? 404
          : 500;
      return ApiResponse.error(
        res,
        "Could not finalize item clear transaction.",
        status,
        error.message,
      );
    }
  }

  /**
   * Permanently deletes a single notification belonging to the authenticated user.
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const notificationId = parsePositiveInteger(req.params.notificationId);
      if (!notificationId) {
        return ApiResponse.error(
          res,
          "Notification item index ID parameter is required.",
          400,
        );
      }

      const authUserId = getAuthUserId(req);
      if (!authUserId) {
        return ApiResponse.error(res, "Authentication required.", 401);
      }

      const deleted = await NotificationService.deleteUserNotification(
        Number(notificationId),
        authUserId,
      );

      return ApiResponse.success(
        res,
        "Notification deleted successfully.",
        deleted,
      );
    } catch (error: any) {
      const status =
        error.message === "Notification not found or access denied."
          ? 404
          : 500;
      return ApiResponse.error(
        res,
        "Could not delete notification.",
        status,
        error.message,
      );
    }
  }

  /**
   * Clears all notifications for the authenticated user (must match route userId).
   */
  static async clearUserFeed(req: Request, res: Response) {
    try {
      const userId = parsePositiveInteger(req.params.userId);
      if (!userId) {
        return ApiResponse.error(
          res,
          "Missing recipient userId reference key.",
          400,
        );
      }

      const authUserId = getAuthUserId(req);
      if (!authUserId || authUserId !== userId) {
        return ApiResponse.error(
          res,
          "You can only clear your own notifications.",
          403,
        );
      }

      const result =
        await NotificationService.deleteAllUserNotifications(authUserId);

      return ApiResponse.success(
        res,
        "All notifications cleared successfully.",
        { deletedCount: result.count },
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        "Could not clear notification feed.",
        500,
        error.message,
      );
    }
  }

  /**
   * Administrative Validation Route to manually test the delivery pipeline
   * of the template styles via REST clients like Postman or curl.
   */
  static async triggerManualAlert(req: Request, res: Response) {
    try {
      const recipientUserId = parsePositiveInteger(req.body.recipientUserId);
      const notificationType = req.body.notificationType as
        | NotificationType
        | string;
      const context = req.body.context;

      if (
        !recipientUserId ||
        !notificationType ||
        typeof notificationType !== "string" ||
        !context
      ) {
        return ApiResponse.error(
          res,
          "Missing or invalid transaction parameters: recipientUserId, notificationType, or context.",
          400,
        );
      }

      // Safe validation array utilizing the specific structural type definitions
      const allowedKeys: NotificationType[] = [
        "APPROVED",
        "REJECTED",
        "INSPECTION",
        "EXPIRY_ALERT",
        "CRITICAL_ISSUE",
        "NEW_APPLICATION",
      ];
      if (!allowedKeys.includes(notificationType as NotificationType)) {
        return ApiResponse.error(
          res,
          `Invalid notificationType structure parameter provided. Permissible parameters: ${allowedKeys.join(", ")}`,
          400,
        );
      }

      await NotificationService.sendBilingualAlert(
        recipientUserId,
        notificationType as NotificationType,
        context,
      );

      return ApiResponse.success(
        res,
        `Automated system alert event loop (${notificationType}) completed successfully.`,
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        "Administrative manual alert engine failed to execute.",
        500,
        error.message,
      );
    }
  }

  /**
   * Admin endpoint: list failed email sends queued for manual retry
   */
  static async listFailed(req: Request, res: Response) {
    try {
      const items = await NotificationService.listFailedEmails();
      return ApiResponse.success(
        res,
        "Failed notification queue fetched.",
        items,
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        "Could not read failed notification queue.",
        500,
        error.message,
      );
    }
  }

  /**
   * Admin endpoint: resend a queued failed email by its `id`.
   */
  static async resendFailed(req: Request, res: Response) {
    try {
      const id = String(req.body.id || "").trim();
      if (!id) return ApiResponse.error(res, "Missing failed item id.", 400);

      await NotificationService.resendFailedEmail(id);
      return ApiResponse.success(
        res,
        "Resend attempt completed (success removes item).",
        null,
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        "Resend failed or item not found.",
        500,
        error.message,
      );
    }
  }

  /**
   * Notifies all admin users when a new application is submitted.
   */
  static async notifyAdminsOnApplicationSubmission(
    req: Request,
    res: Response,
  ) {
    try {
      console.log(
        "[Notification Controller] Received request to notify admins about application submission",
      );
      console.log("[Notification Controller] Request body:", req.body);

      const organizationName = String(req.body.organizationName || "").trim();
      const organizationNameAm = String(
        req.body.organizationNameAm || "",
      ).trim();
      const applicationType = String(req.body.applicationType || "").trim();

      if (!organizationName || !applicationType) {
        console.error("[Notification Controller] Missing required fields", {
          organizationName,
          organizationNameAm,
          applicationType,
        });
        return ApiResponse.error(
          res,
          "Missing required fields: organizationName, applicationType",
          400,
        );
      }

      await NotificationService.notifyAdminsOnApplicationSubmission(
        organizationName,
        organizationNameAm || organizationName,
        applicationType,
      );

      console.log("[Notification Controller] Admins notified successfully");
      return ApiResponse.success(
        res,
        "Admins notified successfully about new application submission.",
        null,
      );
    } catch (error: any) {
      console.error(
        "[Notification Controller] Failed to notify admins about application submission:",
        error.message,
        error.stack,
      );
      return ApiResponse.error(
        res,
        "Failed to notify admins about application submission.",
        500,
        error.message,
      );
    }
  }
}
