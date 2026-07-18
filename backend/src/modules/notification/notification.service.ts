// filepath: src/modules/notification/notification.service.ts
import prisma from "../../lib/prisma";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  NotificationType,
  NotificationContext,
  getBilingualTemplate,
} from "./notification.types";
import { getUsersByRole } from "../user/user.service";

interface SmtpSendError {
  responseCode?: number;
  code?: string;
}

// Configure production SMTP Transporter using safe .env configurations
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const isGmail = (process.env.SMTP_HOST || "").includes("gmail");
// For Gmail, enforce port 465 with secure=true to avoid IPv6 timeouts on port 587
const smtpPort = isGmail ? 465 : Number(process.env.SMTP_PORT || 587);
const smtpSecure = smtpPort === 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const SMTP_TIMEOUT_MS = 15000;
const SMTP_RETRY_DELAY_MS = 400;
const SMTP_MAX_ATTEMPTS = 2;

const makeTransportConfig = (host: string, port: number, secure: boolean) =>
  ({
    host,
    port,
    secure,
    pool: true,
    maxConnections: 5,
    maxMessages: Infinity,
    dnsFamily: 4,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    requireTLS: !secure,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  }) as any;

const transporter = nodemailer.createTransport(
  makeTransportConfig(smtpHost, smtpPort, smtpSecure),
);

let smtpAuthFailed = false;
let smtpVerifyPromise: Promise<void> | null = null;

const BACKEND_ROOT = path.resolve(__dirname, "../../../");
const FAILED_QUEUE_PATH = path.join(
  BACKEND_ROOT,
  "notification_failed_queue.json",
);

const verifySmtpTransporter = async () => {
  if (!smtpUser || !smtpPass) {
    smtpAuthFailed = true;
    console.warn(
      "[Notification Service] SMTP credentials are not configured. Email delivery will be disabled until SMTP_USER and SMTP_PASS are set.",
    );
    return;
  }

  if (smtpVerifyPromise) {
    return smtpVerifyPromise;
  }

  smtpVerifyPromise = transporter
    .verify()
    .then(() => {
      smtpAuthFailed = false;
      console.log(
        "[Notification Service] SMTP transporter verified successfully.",
      );
    })
    .catch((verifyError: any) => {
      smtpVerifyPromise = null;
      smtpAuthFailed = true;
      console.warn(
        "[Notification Service] SMTP transporter verify failed:",
        verifyError?.message || verifyError,
      );
      console.warn(
        "[Notification Service] SMTP auth failed. Future email attempts will be skipped until valid SMTP credentials are provided.",
      );
      throw verifyError;
    });

  return smtpVerifyPromise;
};

verifySmtpTransporter().catch(() => undefined);

export class NotificationService {
  /**
   * Retrieves all notification feed items for a specific user,
   * ordered with the newest alerts at the top.
   */
  static async getUserNotifications(recipientUserId: number) {
    return await prisma.notification.findMany({
      where: { recipientUserId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Generates an explicit localized data log inside your SQL Server database
   * and dispatches a matching, highly responsive email template to the user.
   */
  static async sendBilingualAlert(
    recipientUserId: number,
    type: NotificationType,
    ctx: NotificationContext,
  ) {
    try {
      // 1. Fetch intended user credentials from database safely
      const user = await prisma.user.findUnique({
        where: { id: recipientUserId },
      });

      if (!user) {
        console.warn(
          `[Notification Service]: Execution stopped. User ID ${recipientUserId} missing from database.`,
        );
        return;
      }

      // 2. Extract matching bilingual template text structures from your specific configuration function
      const template = getBilingualTemplate(type, ctx);
      if (!template) {
        throw new Error(`Unsupported notification type: ${type}`);
      }
      const combinedTitle = `${template.titleEn} / ${template.titleAm}`;
      const plainTextFallback = `${template.msgEn}\n\n${template.msgAm}`;

      // 3. Assign premium accent palette colors based on structural urgency status
      let layoutThemeColor = "#17a2b8"; // Default Info Cyan
      switch (type) {
        case "APPROVED":
          layoutThemeColor = "#1e7e34"; // Success Emerald Green
          break;
        case "REJECTED":
          layoutThemeColor = "#bd2130"; // Warning/Error Crimson Red
          break;
        case "INSPECTION":
          layoutThemeColor = "#3d77b4"; // Corporate Information Blue
          break;
        case "EXPIRY_ALERT":
          layoutThemeColor = "#e0a800"; // Cautionary Warning Golden Amber
          break;
        case "CRITICAL_ISSUE":
          layoutThemeColor = "#5a34a1"; // Critical System Enforcement Purple
          break;
        case "NEW_APPLICATION":
          layoutThemeColor = "#28a745"; // New Application Green
          break;
      }

      // 4. Save to SQL Server notifications table for real-time app dashboard feed tracking
      const databaseLog = await prisma.notification.create({
        data: {
          recipientUserId: recipientUserId,
          notificationType: type, // Mapped directly to schema definition: VARCHAR(50)
          alertTitle: combinedTitle.substring(0, 255), // Bound guard safety for schema limit NVARCHAR(255)
          alertMessage: plainTextFallback, // Complete combined block stored in NVARCHAR(Max)
          isReadByRecipient: false,
        },
      });

      let descriptiveMetadataHTML = "";
      // 5. Build dynamic contextual block variations for the interactive email template
      // (Removed System Security Tracking Data Matrix as it's not necessary for end-user notifications)
      if (ctx.daysRemaining !== undefined)
        descriptiveMetadataHTML += `<li><strong>Days Remaining Until Breach:</strong> ${ctx.daysRemaining} Days</li>`;

      // 6. Dispatch SMTP email delivery in the background so notification creation
      // remains fast even when the mail server is slow or temporarily unavailable.
      void NotificationService.dispatchEmailDelivery({
        recipientUserId,
        type,
        ctx,
        user,
        template,
        plainTextFallback,
        layoutThemeColor,
      });
    } catch (error) {
      console.error(
        " [Notification Service System Failure]: Critical exception encountered inside pipeline process loop:",
        error,
      );
    }
  }

  private static async dispatchEmailDelivery(payload: {
    recipientUserId: number;
    type: NotificationType;
    ctx: NotificationContext;
    user: { email?: string | null };
    template: ReturnType<typeof getBilingualTemplate>;
    plainTextFallback: string;
    layoutThemeColor: string;
  }) {
    const {
      recipientUserId,
      type,
      ctx,
      user,
      template,
      plainTextFallback,
      layoutThemeColor,
    } = payload;
    const smtpConfigured = Boolean(
      smtpHost && smtpPort && smtpUser && smtpPass,
    );

    if (!smtpConfigured) {
      console.warn(
        "⚠️ [SMTP Mailer Warning]: SMTP configuration is incomplete. Skipping email delivery.",
      );
      return;
    }

    if (!user.email || !user.email.includes("@")) {
      console.warn(
        `⚠️ [SMTP Mailer Warning]: Recipient User ID ${recipientUserId} lacks a valid email string address.`,
      );
      return;
    }

    if (smtpAuthFailed) {
      console.warn(
        "[SMTP Mailer]: SMTP auth previously failed; skipping email delivery until valid SMTP credentials are provided.",
      );
      return;
    }

    try {
      await verifySmtpTransporter();
    } catch {
      console.warn(
        "[SMTP Mailer]: SMTP transporter verification failed; skipping email delivery until valid SMTP credentials are provided.",
      );
      return;
    }

    if (smtpAuthFailed) {
      console.warn(
        "[SMTP Mailer]: SMTP auth previously failed; skipping email delivery until valid SMTP credentials are provided.",
      );
      return;
    }

    const mailOptions = {
      from: `"EFP-PSO" <${smtpUser}>`,
      to: user.email,
      subject: `[EFP-PSO] ${template.titleEn}`,
      text: plainTextFallback,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; line-height: 1.6; max-width: 650px; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin: 0 auto; color: #333333;">
          <div style="background-color: ${layoutThemeColor}; color: #ffffff; padding: 20px; font-size: 20px; font-weight: bold; border-radius: 8px 8px 0 0; text-align: center; letter-spacing: 0.5px;">
            EFP-PSO Central Operations Alert Node
          </div>
          <div style="padding: 20px 10px;">
            <h3 style="color: ${layoutThemeColor}; border-bottom: 2px solid #f1f3f5; padding-bottom: 8px; margin-top: 0; font-size: 17px;">
              ${template.titleEn}
            </h3>
            <p style="font-size: 15px; color: #2d3748; margin-bottom: 25px; background-color: #f8f9fa; padding: 15px; border-left: 4px solid ${layoutThemeColor}; border-radius: 4px;">
              ${template.msgEn}
            </p>
            <h3 style="color: ${layoutThemeColor}; border-bottom: 2px solid #f1f3f5; padding-bottom: 8px; font-size: 16px; margin-top: 25px;">
              ${template.titleAm}
            </h3>
            <p style="font-size: 15px; color: #2d3748; margin-bottom: 25px; background-color: #f8f9fa; padding: 15px; border-left: 4px solid ${layoutThemeColor}; border-radius: 4px; direction: ltr; text-align: left;">
              ${template.msgAm}
            </p>
          </div>
          <hr style="border: 0; border-top: 1px solid #dee2e6; margin: 25px 0;" />
          <p style="font-size: 11px; color: #adb5bd; text-align: center; margin-bottom: 0;">
            This is a secure automated notification generated from your institutional administrative account profile on the EFP-PSO ERP Platform. Please do not reply directly to this mailer node.
          </p>
        </div>
      `,
    };

    try {
      await NotificationService.attemptSendWithRetries(mailOptions);
    } catch (sendError: unknown) {
      const smtpError = sendError as SmtpSendError;
      if (smtpError.responseCode === 535 || smtpError.code === "EAUTH") {
        smtpAuthFailed = true;
        console.error(
          ` [SMTP Mailer]: SMTP auth failed for ${user.email}. Disabling further retries until credentials are fixed.`,
          sendError,
        );
      } else {
        console.error(
          ` [SMTP Mailer]: Failed to send after retries to ${user.email}, enqueueing for manual resend.`,
          sendError,
        );
        await NotificationService.enqueueFailedEmail({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          recipientUserId,
          notificationType: type,
          context: ctx,
          mailOptions,
          attempts: 0,
          lastError: String(sendError),
        });
      }
    }
  }

  private static async attemptSendWithRetries(mailOptions: any) {
    let attempt = 0;
    let lastError: any = null;

    while (attempt < SMTP_MAX_ATTEMPTS) {
      try {
        attempt += 1;
        await NotificationService.sendMailWithTimeout(
          mailOptions,
          SMTP_TIMEOUT_MS,
        );
        return;
      } catch (err) {
        lastError = err;
        if (attempt >= SMTP_MAX_ATTEMPTS) break;
        console.warn(
          `[SMTP Retry] Attempt ${attempt}/${SMTP_MAX_ATTEMPTS} for ${mailOptions.to} failed. Retrying in ${SMTP_RETRY_DELAY_MS}ms...`,
        );
        await new Promise((r) => setTimeout(r, SMTP_RETRY_DELAY_MS));
      }
    }

    throw lastError;
  }

  private static async sendMailWithTimeout(
    mailOptions: any,
    timeoutMs = 10000,
  ) {
    return NotificationService.sendMailWithTimeoutWithTransport(
      transporter,
      mailOptions,
      timeoutMs,
    );
  }

  private static async sendMailWithTimeoutWithTransport(
    transport: nodemailer.Transporter,
    mailOptions: any,
    timeoutMs = 10000,
  ) {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`SMTP send timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      transport.sendMail(mailOptions, (error) => {
        clearTimeout(timeout);
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  private static async readFailureQueue(): Promise<any[]> {
    try {
      const raw = await fs.readFile(FAILED_QUEUE_PATH, "utf8");
      return JSON.parse(raw || "[]");
    } catch (err: any) {
      if (err.code === "ENOENT") return [];
      console.error("[Notification Queue] read error:", err);
      return [];
    }
  }

  private static async writeFailureQueue(items: any[]) {
    try {
      await fs.mkdir(path.dirname(FAILED_QUEUE_PATH), { recursive: true });
      await fs.writeFile(
        FAILED_QUEUE_PATH,
        JSON.stringify(items, null, 2),
        "utf8",
      );
    } catch (err) {
      console.error("[Notification Queue] write error:", err);
    }
  }

  static async enqueueFailedEmail(payload: any) {
    const list = await NotificationService.readFailureQueue();
    list.push(payload);
    await NotificationService.writeFailureQueue(list);
  }

  static async listFailedEmails() {
    return await NotificationService.readFailureQueue();
  }

  static async resendFailedEmail(id: string) {
    const list = await NotificationService.readFailureQueue();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Failed item not found");
    const item = list[idx];
    try {
      await NotificationService.attemptSendWithRetries(item.mailOptions);
      // remove from queue on success
      list.splice(idx, 1);
      await NotificationService.writeFailureQueue(list);
      return { success: true };
    } catch (err) {
      // update attempts and lastError
      item.attempts = (item.attempts || 0) + 1;
      item.lastError = String(err);
      list[idx] = item;
      await NotificationService.writeFailureQueue(list);
      throw err;
    }
  }

  /**
   * Updates a single targeted alert block visibility state to read.
   * Only the recipient may mark their own notification.
   */
  static async markAsRead(notificationId: number, recipientUserId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, recipientUserId },
    });
    if (!notification) {
      throw new Error("Notification not found or access denied.");
    }
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isReadByRecipient: true },
    });
  }

  /**
   * Permanently removes a notification owned by the recipient user.
   */
  static async deleteUserNotification(
    notificationId: number,
    recipientUserId: number,
  ) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, recipientUserId },
    });
    if (!notification) {
      throw new Error("Notification not found or access denied.");
    }
    return await prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Removes all notifications for a specific recipient user.
   */
  static async deleteAllUserNotifications(recipientUserId: number) {
    return await prisma.notification.deleteMany({
      where: { recipientUserId },
    });
  }

  /**
   * Notifies all admin users about a new application submission.
   */
  static async notifyAdminsOnApplicationSubmission(
    organizationName: string,
    organizationNameAm: string,
    applicationType: string,
  ) {
    try {
      console.log(
        `[Notification Service] Starting admin notification for: ${organizationName}`,
      );
      // Get all active admin users (admin, super_admin)
      const adminRoles = ["admin", "super_admin"];
      const adminUsers = [];

      for (const role of adminRoles) {
        console.log(`[Notification Service] Fetching users with role: ${role}`);
        const users = await getUsersByRole(role);
        console.log(
          `[Notification Service] Found ${users.length} users with role: ${role}`,
        );
        adminUsers.push(...users);
      }

      // Remove duplicates
      const uniqueAdmins = Array.from(
        new Map(adminUsers.map((user) => [user.id, user])).values(),
      );

      console.log(
        `[Notification Service] Total unique admin users to notify: ${uniqueAdmins.length}`,
      );

      if (uniqueAdmins.length === 0) {
        console.warn(
          "[Notification Service] No admin users found in the database. Notifications will not be sent.",
        );
        return;
      }

      // Send notification to each admin
      for (const admin of uniqueAdmins) {
        console.log(
          `[Notification Service] Sending notification to admin user ID: ${admin.id}, email: ${admin.email}`,
        );
        await NotificationService.sendBilingualAlert(
          admin.id,
          "NEW_APPLICATION",
          {
            organizationName,
            organizationNameAm,
            customDetailsEn: applicationType,
            customDetailsAm: applicationType,
          },
        );
      }

      console.log(
        `[Notification Service] Successfully notified ${uniqueAdmins.length} admin users about new application submission.`,
      );
    } catch (error: any) {
      console.error(
        `[Notification Service] Failed to notify admins about application submission:`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Notifies all admin and super_admin users about a new formal request letter submission.
   */
  static async notifyAdminsOnFormalRequestSubmission(
    applicantFullName: string,
    applicantId: number,
  ) {
    try {
      console.log(
        `[Notification Service] Starting admin notification for formal request submission by user ID: ${applicantId}`,
      );

      // Fetch the actual user data from database to get the correct fullName and faydaId
      const applicant = await prisma.user.findUnique({
        where: { id: applicantId },
        select: {
          id: true,
          fullName: true,
          faydaId: true,
        },
      });

      if (!applicant) {
        console.warn(
          `[Notification Service] Applicant user ID ${applicantId} not found in database`,
        );
        return;
      }

      const actualFullName = applicant.fullName || applicantFullName;
      const actualFaydaId = applicant.faydaId || String(applicantId);

      console.log(
        `[Notification Service] Fetched applicant details - Name: ${actualFullName}, Fayda ID: ${actualFaydaId}`,
      );

      // Get all admin users (admin, super_admin)
      const adminRoles = ["admin", "super_admin"];
      const adminUsers = [];

      for (const role of adminRoles) {
        console.log(`[Notification Service] Fetching users with role: ${role}`);
        const users = await getUsersByRole(role);
        console.log(
          `[Notification Service] Found ${users.length} users with role: ${role}`,
        );
        adminUsers.push(...users);
      }

      // Remove duplicates
      const uniqueAdmins = Array.from(
        new Map(adminUsers.map((user) => [user.id, user])).values(),
      );

      console.log(
        `[Notification Service] Total unique admin users to notify: ${uniqueAdmins.length}`,
      );

      if (uniqueAdmins.length === 0) {
        console.warn(
          "[Notification Service] No admin users found in the database. Notifications will not be sent.",
        );
        return;
      }

      // Send notification to each admin
      for (const admin of uniqueAdmins) {
        console.log(
          `[Notification Service] Sending formal request notification to admin user ID: ${admin.id}, email: ${admin.email}`,
        );
        await NotificationService.sendBilingualAlert(
          admin.id,
          "FORMAL_REQUEST_SUBMITTED",
          {
            organizationName: actualFullName,
            organizationNameAm: actualFaydaId,
          },
        );
      }

      console.log(
        `[Notification Service] Successfully notified ${uniqueAdmins.length} admin users about formal request letter submission.`,
      );
    } catch (error: any) {
      console.error(
        `[Notification Service] Failed to notify admins about formal request submission:`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Notifies all active admin and super_admin users about a newly submitted criminal report.
   */
  static async notifyAdminsOnCriminalReportSubmission(
    recordNumber: string,
    organizationName: string,
    submittedByName: string,
  ) {
    try {
      const adminRoles = ["admin", "super_admin"];
      const adminUsers = [] as Array<{ id: number; email?: string | null }>;

      for (const role of adminRoles) {
        const users = await getUsersByRole(role);
        adminUsers.push(...users);
      }

      const uniqueAdmins = Array.from(
        new Map(adminUsers.map((user) => [user.id, user])).values(),
      );

      if (uniqueAdmins.length === 0) {
        console.warn(
          "[Notification Service] No active admin/super_admin users found for criminal report notification.",
        );
        return;
      }

      for (const admin of uniqueAdmins) {
        await NotificationService.sendBilingualAlert(
          admin.id,
          "CRIMINAL_REPORT_SUBMITTED",
          {
            organizationName,
            organizationNameAm: organizationName,
            customDetailsEn: recordNumber,
            customDetailsAm: submittedByName,
          },
        );
      }
    } catch (error: any) {
      console.error(
        "[Notification Service] Failed to notify admins about criminal report submission:",
        error?.message || error,
      );
    }
  }

  /**
   * Notify all users with role `licensing_authority` when a certificate
   * has been signed by an admin or super_admin.
   * This will avoid duplicate sends within a 24h window for the same certificate
   * by checking for an existing similar notification message.
   */
  static async notifyLicensingAuthoritiesForSignedCertificate(
    certificationId: number,
  ) {
    try {
      const cert = await prisma.certification.findUnique({
        where: { id: certificationId },
        include: {
          signedByOfficial: {
            include: {
              user: { include: { user_roles: { include: { roles: true } } } },
            },
          },
          organization: { select: { nameEnglish: true, nameAmharic: true } },
        },
      });

      if (!cert || !cert.signedByOfficial) return;

      const signerRoles =
        cert.signedByOfficial.user?.user_roles?.map((ur: any) =>
          String(ur.roles.role_name || "").toLowerCase(),
        ) || [];

      // Only notify licensing authorities when the signer is an admin-like user
      const adminLike = signerRoles.some(
        (r: string) =>
          r === "admin" || r === "super_admin" || r.includes("admin"),
      );
      if (!adminLike) return;

      const orgName = cert.organization?.nameEnglish || null;
      const orgNameAm = cert.organization?.nameAmharic || null;
      const serial = cert.certificateSerialNumber || null;

      const laUsers = await getUsersByRole("licensing_authority");
      if (!laUsers || laUsers.length === 0) return;

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      for (const user of laUsers) {
        // Basic idempotency: avoid duplicate notifications for same cert within 24h
        const existing = await prisma.notification.findFirst({
          where: {
            recipientUserId: user.id,
            alertMessage: { contains: serial ?? "" },
            createdAt: { gte: twentyFourHoursAgo },
          },
        });

        if (existing) continue;

        await NotificationService.sendBilingualAlert(user.id, "CERT_SIGNED", {
          organizationName: orgName || undefined,
          organizationNameAm: orgNameAm || undefined,
          certificateSerial: serial || undefined,
          customDetailsEn: `Certificate ${serial || "(unknown)"} was signed and requires stamping.`,
          customDetailsAm: `ሰርቲፍኬት ${serial || "(ያልታወቀ)"} ጸድቋል እና ማቀዝቀዣ ይፈልጋል።`,
        });
      }
    } catch (err) {
      console.error(
        "[Notification Service] Failed to notify licensing authorities:",
        err,
      );
    }
  }

  /**
   * Notifies the applicant when their formal request is approved or rejected.
   */
  static async notifyApplicantOnFormalRequestStatusChange(
    userId: number,
    status: "APPROVED" | "REJECTED",
    adminFeedback?: string | null,
  ) {
    try {
      // Fetch user with Fayida ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          faydaId: true,
        },
      });

      if (!user) {
        console.warn(
          `[Notification Service] User ID ${userId} not found for formal request notification.`,
        );
        return;
      }

      console.log(
        `[Notification Service] Notifying applicant ${user.fullName} (#${user.faydaId}) about formal request ${status}`,
      );

      const notificationType =
        status === "APPROVED"
          ? "FORMAL_REQUEST_APPROVED"
          : "FORMAL_REQUEST_REJECTED";

      await NotificationService.sendBilingualAlert(user.id, notificationType, {
        organizationName: user.fullName,
        organizationNameAm: user.faydaId,
        customDetailsEn:
          adminFeedback || "Your formal request has been processed.",
        customDetailsAm: adminFeedback || "የእርስዎ ፈቃድ ደብዳቤ ጥያቄ ተስተካክሏል።",
      });

      console.log(
        `[Notification Service] Successfully notified applicant ${user.fullName} about formal request ${status}`,
      );
    } catch (error: any) {
      console.error(
        `[Notification Service] Failed to notify applicant about formal request status change:`,
        error.message,
      );
      throw error;
    }
  }
}
