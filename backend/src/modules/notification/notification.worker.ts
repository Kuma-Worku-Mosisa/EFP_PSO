// filepath: src/modules/notification/notification.worker.ts
import cron from "node-cron";
import prisma from "../../lib/prisma";
import { NotificationService } from "./notification.service";

/**
 * Sweeps the database for expiring certificates, automatically calculates days left,
 * handles targeted notifications, and auto-expires past-due certificates to enforce 
 * the annual Chapa renewal cycle.
 */
export const sweepAndNotifyExpiringCertifications = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Strip time parameters for accurate midnight comparison

    // ─── STEP 1: AUTO-EXPIRE PAST DUE CERTIFICATES ─────────────────────────
    // Flips certificates that passed midnight to EXPIRED so they must re-apply/re-pay via Chapa
    const expiredResult = await prisma.certification.updateMany({
      where: {
        status: { in: ["Active", "ACTIVE"] },
        expiryDate: {
          lt: today,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    if (expiredResult.count > 0) {
      console.log(
        `[Worker Engine]: Successfully moved ${expiredResult.count} passed-date certificates to EXPIRED status.`,
      );
    }

    // ─── STEP 2: SWEEP AND NOTIFY UPCOMING EXPIRATIONS ─────────────────────
    // Lookahead window boundary (maximum 30 days out)
    const maxLookaheadDate = new Date(today);
    maxLookaheadDate.setDate(maxLookaheadDate.getDate() + 31);

    // Fetch certifications expiring within our warning window
    const activeCertifications = await prisma.certification.findMany({
      where: {
        status: { in: ["Active", "ACTIVE"] },
        expiryDate: {
          gte: today,
          lte: maxLookaheadDate,
        },
      },
      include: {
        organization: true,
        application: true, // Crucial: Includes the application relation to capture the associated user ID
      },
    });

    console.log(
      `[Worker Engine]: Found ${activeCertifications.length} active certificates expiring within 30 days.`,
    );

    for (const cert of activeCertifications) {
      // Resolve the correct recipient ID via the application relation layer
      const recipientUserId = cert.application?.userId;

      if (!recipientUserId) {
        console.warn(
          `[Worker Engine Warning]: Certification ID ${cert.id} has no valid user linked via its application record. Skipping.`,
        );
        continue;
      }

      // Automatically calculate days remaining from expiryDate
      const expiry = new Date(cert.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      const timeDifference = expiry.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      // Notification milestones: Only alert the user on targeted days to prevent spam
      const notificationMilestones = [30, 15, 5, 1];

      if (notificationMilestones.includes(daysLeft)) {
        // Safe fallback resolution using your exact schema bilingual name fields
        const orgName =
          cert.organization?.nameEnglish ||
          cert.organization?.nameAmharic ||
          "Your Security Agency";

        // Reverted back to the original allowed fields to fix the 'NotificationContext' type error
        await NotificationService.sendBilingualAlert(
          recipientUserId,
          "EXPIRY_ALERT",
          {
            organizationName: orgName,
            certificateSerial: cert.certificateSerialNumber || "N/A",
            daysRemaining: daysLeft,
          },
        );

        console.log(
          `[Worker Engine]: Dispatched bilingual renewal alert to User ID ${recipientUserId} for ${daysLeft} days remaining.`,
        );
      }
    }
  } catch (error) {
    console.error(
      "[Worker Engine Failure]: Error executing automated expiration metrics calculation:",
      error,
    );
  }
};

export const runNotificationCronWorker = () => {
  // Evaluates database state rules once every day precisely at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log(
      "[Worker Engine]: Initializing daily automated expiration verification sweep...",
    );
    await sweepAndNotifyExpiringCertifications();
  });
};