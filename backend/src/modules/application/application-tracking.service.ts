import type { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";

export const ApplicationTrackingStatus = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  CorrectionRequested: "Correction Requested",
  Reviewing: "Reviewing",
} as const;

export type ApplicationTrackingStatusValue =
  (typeof ApplicationTrackingStatus)[keyof typeof ApplicationTrackingStatus];

export interface ApplicationTrackingHistoryInput {
  applicationId: number;
  statusState: ApplicationTrackingStatusValue;
  remarks?: string | null;
  changedBy: number;
}

type PrismaClientLike =
  | Prisma.TransactionClient
  | typeof prisma
  | {
      applicationTrackingHistory: {
        create: (args: {
          data: {
            applicationId: number;
            statusState: string;
            remarks?: string | null;
            changedBy: number;
          };
        }) => Promise<unknown>;
      };
    };

export class ApplicationTrackingService {
  static async recordHistory(
    client: PrismaClientLike,
    input: ApplicationTrackingHistoryInput,
  ) {
    return client.applicationTrackingHistory.create({
      data: {
        applicationId: input.applicationId,
        statusState: input.statusState,
        remarks: input.remarks ?? null,
        changedBy: input.changedBy,
      },
    });
  }

  static async getHistoryByApplicationId(applicationId: number) {
    return prisma.applicationTrackingHistory.findMany({
      where: { applicationId },
      orderBy: { changedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }
}

export default ApplicationTrackingService;
