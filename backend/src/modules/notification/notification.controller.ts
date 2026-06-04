// filepath: src/modules/notification/notification.controller.ts
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { NotificationService } from "./notification.service";
import { NotificationType } from "./notification.types";

export class NotificationController {
  /**
   * Retrieves the dynamic live notification feed array for an authenticated user,
   * sorted cleanly with the newest operational status developments at the top.
   */
  static async getMyFeed(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return ApiResponse.error(
          res,
          "Missing recipient userId reference key.",
          400,
        );
      }

      const activeFeeds = await NotificationService.getUserNotifications(
        Number(userId),
      );

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
      const { notificationId } = req.body;
      if (!notificationId) {
        return ApiResponse.error(
          res,
          "Notification item index ID parameter is required.",
          400,
        );
      }

      const updatedLog = await NotificationService.markAsRead(
        Number(notificationId),
      );

      return ApiResponse.success(
        res,
        "Notification flagged as read execution complete.",
        updatedLog,
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        "Could not finalize item clear transaction.",
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
      const { recipientUserId, notificationType, context } = req.body;

      if (!recipientUserId || !notificationType || !context) {
        return ApiResponse.error(
          res,
          "Missing required transaction parameters: recipientUserId, notificationType, or context block.",
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
        Number(recipientUserId),
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
      const { id } = req.body;
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
  static async notifyAdminsOnApplicationSubmission(req: Request, res: Response) {
    try {
      console.log(
        "[Notification Controller] Received request to notify admins about application submission",
      );
      console.log("[Notification Controller] Request body:", req.body);

      const { organizationName, organizationNameAm, applicationType } = req.body;

      if (!organizationName || !applicationType) {
        console.error(
          "[Notification Controller] Missing required fields",
          { organizationName, applicationType },
        );
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
