// filepath: src/update-and-test-worker.ts
import * as dotenv from "dotenv";
import path from "path";

// 1. Load your .env file to authorize background SMTP mail transmission paths
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import prisma from "./lib/prisma";
import { sweepAndNotifyExpiringCertifications } from "./modules/notification/notification.worker";

async function updateCertificateAndRunWorker() {
  const targetCertificationId = 20;

  console.log("==================================================");
  console.log(
    `[Production Update Test]: Target Certification ID: ${targetCertificationId}`,
  );
  console.log("==================================================");

  try {
    // 2. Calculate a precise date exactly 30 days out from today
    const targetExpiryDate = new Date();
    targetExpiryDate.setDate(targetExpiryDate.getDate() + 30);

    console.log(`[Step 1]: Updating certificate in SQL Server...`);
    // 3. Update the record instead of creating a new one
    // Ensure the status matches the string capitalization your worker searches for ("ACTIVE")
    const updatedCert = await prisma.certification.update({
      where: { id: targetCertificationId },
      data: {
        expiryDate: targetExpiryDate,
        status: "ACTIVE",
      },
    });

    console.log(
      `✅ SUCCESS: Certificate Serial ${updatedCert.certificateSerialNumber} updated!`,
    );
    console.log(
      ` - New Expiry Timestamp: ${updatedCert.expiryDate.toISOString()} (Exactly 30 days left)`,
    );
    console.log("--------------------------------------------------");

    console.log(
      `[Step 2]: Triggering automated cron worker scanning sweep engine...`,
    );
    // 4. Run your exact live worker code
    await sweepAndNotifyExpiringCertifications();
  } catch (error) {
    console.error("❌ Pipeline execution encountered an error:", error);
  } finally {
    // 5. Keep connection pool alive for 6 seconds for background email delivery dispatching
    console.log(
      "\n⏳ Keeping pipe open briefly for SMTP transmission loops...",
    );
    setTimeout(async () => {
      await prisma.$disconnect();
      console.log("🏁 Production data test routine complete.");
      process.exit(0);
    }, 6000);
  }
}

updateCertificateAndRunWorker();
