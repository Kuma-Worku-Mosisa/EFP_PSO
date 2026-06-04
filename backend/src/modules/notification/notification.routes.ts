// filepath:
import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Endpoint for the frontend to query feed items
router.get("/feed/:userId", NotificationController.getMyFeed);

// Endpoint to toggle visibility status when a user clicks/clears an alert card
router.patch("/read", NotificationController.clearNotification);

// Admin testing endpoint to trigger a manual alert via POST body
router.post("/trigger", NotificationController.triggerManualAlert);
// Admin: list queued failed sends
router.get("/failed", NotificationController.listFailed);
// Admin: resend a failed queued item (body: { id: string })
router.post("/failed/resend", NotificationController.resendFailed);
// Notify admins when a new application is submitted (no auth required for public submission)
router.post("/notify-application-submission", NotificationController.notifyAdminsOnApplicationSubmission);

export default router;
