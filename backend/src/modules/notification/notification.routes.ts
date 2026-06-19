// filepath: backend/src/modules/notification/notification.routes.ts
import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// User feed — authenticated; users may only access their own feed
router.get("/feed/:userId", authenticate, NotificationController.getMyFeed);

// Mark a single notification as read
router.patch("/read", authenticate, NotificationController.clearNotification);

// Clear all notifications for the authenticated user (before /:notificationId)
router.delete(
  "/feed/clear/:userId",
  authenticate,
  NotificationController.clearUserFeed,
);

// Delete a single notification (recipient only)
router.delete(
  "/:notificationId",
  authenticate,
  NotificationController.deleteNotification,
);

// Admin testing endpoint to trigger a manual alert via POST body
router.post("/trigger", NotificationController.triggerManualAlert);
// Admin: list queued failed sends
router.get("/failed", NotificationController.listFailed);
// Admin: resend a failed queued item (body: { id: string })
router.post("/failed/resend", NotificationController.resendFailed);
// Notify admins when a new application is submitted (no auth required for public submission)
router.post(
  "/notify-application-submission",
  NotificationController.notifyAdminsOnApplicationSubmission,
);

export default router;
