import prisma from "../../lib/prisma";
import { createAuditLog } from "../../utils/auditLogger";
import { NotificationService } from "../notification/notification.service";

export class FormalRequestService {
  static async listFormalRequests() {
    return prisma.formalRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            faydaId: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  static async getByUserId(userId: number) {
    return prisma.formalRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            faydaId: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  static async listByUserId(userId: number) {
    return prisma.formalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            faydaId: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  static async createOrUpdateRequest(
    userId: number,
    requestLetterUrl: string,
    actorId?: number,
  ) {
    const result = await prisma.formalRequest.create({
      data: {
        userId,
        requestLetterUrl,
        status: "PENDING",
      },
    });

    await createAuditLog(prisma, {
      userId: actorId ?? userId,
      action: "CREATE",
      entityName: "FormalRequest",
      entityId: result.id,
      oldValue: null,
      newValue: JSON.stringify(result),
    });

    return result;
  }

  static async updateStatus(
    id: number,
    status: "APPROVED" | "REJECTED",
    adminFeedback?: string | null,
    actorId?: number,
  ) {
    const existing = await prisma.formalRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.formalRequest.update({
      where: { id },
      data: {
        status,
        adminFeedback: adminFeedback ?? existing.adminFeedback,
      },
    });

    await createAuditLog(prisma, {
      userId: actorId ?? null,
      action: "UPDATE",
      entityName: "FormalRequest",
      entityId: id,
      oldValue: JSON.stringify(existing),
      newValue: JSON.stringify(updated),
    });

    // Notify the applicant about the status change
    try {
      await NotificationService.notifyApplicantOnFormalRequestStatusChange(
        existing.userId,
        status,
        adminFeedback ?? null,
      );
    } catch (notificationError: any) {
      console.error(
        `[FormalRequest Service] Failed to send notification to applicant: ${notificationError.message}`,
      );
      // Don't throw - notification failure shouldn't block status update
    }

    return updated;
  }

  static async updateFeedback(
    id: number,
    adminFeedback: string,
    actorId?: number,
  ) {
    const existing = await prisma.formalRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.formalRequest.update({
      where: { id },
      data: { adminFeedback },
    });

    await createAuditLog(prisma, {
      userId: actorId ?? null,
      action: "UPDATE",
      entityName: "FormalRequest",
      entityId: id,
      oldValue: JSON.stringify(existing),
      newValue: JSON.stringify(updated),
    });

    return updated;
  }
}
