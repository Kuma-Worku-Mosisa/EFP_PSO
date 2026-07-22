import cron from "node-cron";
import prisma from "../../lib/prisma.js";

/**
 * Daily sweep to expire service contracts whose terminatedAt is past.
 */
export const sweepAndExpireServiceContracts = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.serviceContract.updateMany({
      where: {
        status: { in: ["Active", "ACTIVE"] },
        terminatedAt: {
          lt: today,
        },
      },
      data: {
        status: "Expired",
      },
    });

    if (result.count > 0) {
      console.log(
        `[ServiceContractWorker]: Marked ${result.count} service contract(s) as Expired based on terminatedAt`,
      );
    }
  } catch (error) {
    console.error(
      "[ServiceContractWorker] Error while expiring contracts:",
      error,
    );
  }
};

export const runServiceContractExpiryWorker = () => {
  // Run daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log(
      "[ServiceContractWorker]: Running daily service contract expiry sweep...",
    );
    await sweepAndExpireServiceContracts();
  });
};
