import prisma from "../../lib/prisma";
import { ApplicationTrackingService } from "../application/application-tracking.service";
import { ApplicationService } from "../application/application.service";

export type InspectionDecision = "APPROVE" | "REJECT" | "CORRECTION_REQUESTED";

type ReviewPayload = {
  isLocationValid?: boolean;
  isInfrastructureValid?: boolean;
  isTrainingValid?: boolean;
  findingsSummary?: string | null;
  expertOpinion?: string | null;
};

export class InspectionService {
  static async listInspections(userRoles: string[], userId: number) {
    const isAdmin = userRoles.some((role) =>
      ["admin", "system_admin"].includes(String(role).toLowerCase()),
    );

    return prisma.inspection.findMany({
      where: isAdmin
        ? undefined
        : {
            OR: [
              { leadInspectorId: userId },
              { committeeMembers: { some: { userId } } },
            ],
          },
      orderBy: { createdAt: "desc" },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            applicationDate: true,
            organization: {
              select: {
                id: true,
                nameEnglish: true,
                nameAmharic: true,
              },
            },
            manager: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    username: true,
                    email: true,
                    phone: true,
                    faydaId: true,
                  },
                },
              },
            },
          },
        },
        leadInspector: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
        committeeMembers: {
          select: {
            id: true,
            userId: true,
            expertName: true,
            expertRole: true,
            signatureUrl: true,
            signedAt: true,
          },
        },
      },
    });
  }

  static async getInspectionById(id: number) {
    return prisma.inspection.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                phone: true,
              },
            },
            organization: {
              select: {
                id: true,
                nameEnglish: true,
                nameAmharic: true,
                addressId: true,
                numberOfOffices: true,
                numberOfVehicles: true,
                numberOfComputers: true,
                hasStoreHouse: true,
                address: {
                  select: {
                    id: true,
                    houseNumber: true,
                    specialLocation: true,
                    kebele: {
                      select: {
                        id: true,
                        nameEnglish: true,
                        nameAmharic: true,
                        woreda: {
                          select: {
                            id: true,
                            nameEnglish: true,
                            nameAmharic: true,
                            zone: {
                              select: {
                                id: true,
                                nameEnglish: true,
                                nameAmharic: true,
                                region: {
                                  select: {
                                    id: true,
                                    nameEnglish: true,
                                    nameAmharic: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            manager: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    username: true,
                    email: true,
                    phone: true,
                    faydaId: true,
                  },
                },
              },
            },
            history: {
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
            },
          },
        },
        leadInspector: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
        committeeMembers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  static async createInspection(input: {
    applicationId: number;
    leadInspectorId?: number | null;
    scheduledDate: Date;
    createdByUserId: number;
    committeeMemberIds?: number[];
  }) {
    const committeeMemberIds = Array.from(
      new Set(
        (input.committeeMemberIds || []).filter((id) => Number.isFinite(id)),
      ),
    );

    const inspection = await prisma.$transaction(async (tx) => {
      const createdInspection = await tx.inspection.create({
        data: {
          applicationId: input.applicationId,
          leadInspectorId: input.leadInspectorId ?? null,
          scheduledDate: input.scheduledDate,
          status: "SCHEDULED",
        },
      });

      // Build committee membership list including any explicitly provided committee members
      // and the lead inspector (so the lead can also upload a signature).
      const allCommitteeIds = new Set<number>(committeeMemberIds);
      if (input.leadInspectorId && Number.isFinite(input.leadInspectorId)) {
        allCommitteeIds.add(input.leadInspectorId);
      }

      const idsToPersist = Array.from(allCommitteeIds);

      if (idsToPersist.length > 0) {
        const committeeUsers = await tx.user.findMany({
          where: { id: { in: idsToPersist } },
          select: {
            id: true,
            fullName: true,
            user_roles: {
              include: {
                roles: {
                  select: {
                    role_name: true,
                  },
                },
              },
            },
          },
        });

        const committeeData = committeeUsers.map((user) => ({
          inspectionId: createdInspection.id,
          userId: user.id,
          expertName: user.fullName,
          expertRole:
            user.id === input.leadInspectorId
              ? "Lead Inspector"
              : (user.user_roles[0]?.roles?.role_name ?? "Field Reviewer"),
          signatureUrl: "",
          signedAt: null,
        }));

        if (committeeData.length > 0) {
          await tx.inspectionCommittee.createMany({
            data: committeeData,
          });
        }
      }

      return createdInspection;
    });

    await ApplicationService.markUnderReview(
      input.applicationId,
      input.createdByUserId,
      "Inspection scheduled by admin.",
    );

    return inspection;
  }

  static async submitFieldReview(
    inspectionId: number,
    inspectorUserId: number,
    payload: ReviewPayload,
  ) {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      select: { id: true, applicationId: true, leadInspectorId: true },
    });

    if (!inspection) {
      throw new Error(`Inspection ${inspectionId} not found`);
    }

    if (
      inspection.leadInspectorId &&
      inspection.leadInspectorId !== inspectorUserId
    ) {
      throw new Error("This inspection is assigned to another field reviewer.");
    }

    const updated = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        isLocationValid: payload.isLocationValid ?? false,
        isInfrastructureValid: payload.isInfrastructureValid ?? false,
        isTrainingValid: payload.isTrainingValid ?? false,
        findingsSummary: payload.findingsSummary ?? null,
        expertOpinion: payload.expertOpinion ?? null,
        status: "FIELD_REVIEWED",
      },
    });

    await ApplicationTrackingService.recordHistory(prisma, {
      applicationId: inspection.applicationId!,
      statusState: "Reviewing",
      remarks:
        payload.findingsSummary?.trim() ||
        payload.expertOpinion?.trim() ||
        "Field reviewer completed inspection review.",
      changedBy: inspectorUserId,
    });

    return updated;
  }

  static async confirmFinalReport(input: {
    inspectionId: number;
    userId: number;
    isAdmin: boolean;
    finalReportUrl: string;
  }) {
    const inspection = await prisma.inspection.findUnique({
      where: { id: input.inspectionId },
      select: {
        id: true,
        leadInspectorId: true,
        committeeMembers: {
          select: {
            id: true,
            userId: true,
            signatureUrl: true,
            signedAt: true,
          },
        },
      },
    });

    if (!inspection) {
      throw new Error(`Inspection ${input.inspectionId} not found`);
    }

    if (!input.isAdmin && inspection.leadInspectorId !== input.userId) {
      throw new Error("Only the lead inspector can generate the final report.");
    }

    const committeeMembers = inspection.committeeMembers || [];
    const allSigned =
      committeeMembers.length > 0 &&
      committeeMembers.every(
        (member) => Boolean(member.signatureUrl) && Boolean(member.signedAt),
      );

    if (!allSigned) {
      throw new Error("All inspection committee members must sign first.");
    }

    const updated = await prisma.inspection.update({
      where: { id: input.inspectionId },
      data: {
        finalReportUrl: input.finalReportUrl,
        status: "FIELD_REVIEWED",
      },
    });

    if (inspection.id) {
      const application = await prisma.inspection.findUnique({
        where: { id: input.inspectionId },
        select: { applicationId: true },
      });

      if (application?.applicationId) {
        await ApplicationTrackingService.recordHistory(prisma, {
          applicationId: application.applicationId,
          statusState: "Reviewing",
          remarks: "Final inspection report generated and confirmed.",
          changedBy: input.userId,
        });
      }
    }

    return updated;
  }

  static async uploadCommitteeSignature(input: {
    inspectionId: number;
    committeeId: number;
    userId: number;
    isAdmin: boolean;
    signatureUrl: string;
  }) {
    const committee = await prisma.inspectionCommittee.findUnique({
      where: { id: input.committeeId },
      select: {
        id: true,
        inspectionId: true,
        userId: true,
      },
    });

    if (!committee || committee.inspectionId !== input.inspectionId) {
      throw new Error(`Committee member ${input.committeeId} not found.`);
    }

    if (!input.isAdmin && committee.userId !== input.userId) {
      throw new Error("You can only upload your own committee signature.");
    }

    return prisma.inspectionCommittee.update({
      where: { id: committee.id },
      data: {
        signatureUrl: input.signatureUrl,
        signedAt: new Date(),
      },
    });
  }

  static async clearCommitteeSignature(input: {
    inspectionId: number;
    committeeId: number;
    userId: number;
    isAdmin: boolean;
  }) {
    const committee = await prisma.inspectionCommittee.findUnique({
      where: { id: input.committeeId },
      select: {
        id: true,
        inspectionId: true,
        userId: true,
        signatureUrl: true,
      },
    });

    if (!committee || committee.inspectionId !== input.inspectionId) {
      throw new Error(`Committee member ${input.committeeId} not found.`);
    }

    if (!input.isAdmin && committee.userId !== input.userId) {
      throw new Error("You can only remove your own committee signature.");
    }

    const priorSignatureUrl = committee.signatureUrl || "";

    const updated = await prisma.inspectionCommittee.update({
      where: { id: committee.id },
      data: {
        signatureUrl: "",
        signedAt: null,
      },
    });

    return { ...updated, priorSignatureUrl };
  }

  static async ensureCommitteeRowForUser(input: {
    inspectionId: number;
    userId: number;
    expertName?: string;
    expertRole?: string;
  }) {
    const existing = await prisma.inspectionCommittee.findFirst({
      where: { inspectionId: input.inspectionId, userId: input.userId },
    });

    if (existing) return existing;

    // Try to fetch user details to populate expertName/role
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        fullName: true,
        user_roles: { include: { roles: { select: { role_name: true } } } },
      },
    });

    const created = await prisma.inspectionCommittee.create({
      data: {
        inspectionId: input.inspectionId,
        userId: input.userId,
        expertName: input.expertName ?? user?.fullName ?? "",
        expertRole:
          input.expertRole ??
          user?.user_roles[0]?.roles?.role_name ??
          "Field Reviewer",
        signatureUrl: "",
        signedAt: null,
      },
    });

    return created;
  }

  static async finalizeInspection(
    inspectionId: number,
    adminUserId: number,
    decision: InspectionDecision,
    remarks: string,
  ) {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      select: { id: true, applicationId: true },
    });

    if (!inspection || !inspection.applicationId) {
      throw new Error(`Inspection ${inspectionId} not found`);
    }

    if (decision === "APPROVE") {
      await ApplicationService.approveApplication(
        inspection.applicationId,
        adminUserId,
        remarks,
      );
    } else if (decision === "REJECT") {
      await ApplicationService.rejectApplication(
        inspection.applicationId,
        adminUserId,
        remarks,
      );
    } else {
      await ApplicationService.requestCorrection(
        inspection.applicationId,
        adminUserId,
        remarks,
      );
    }

    return prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        status:
          decision === "APPROVE"
            ? "APPROVED"
            : decision === "REJECT"
              ? "REJECTED"
              : "CORRECTION_REQUESTED",
      },
    });
  }

  static async updateInspection(
    inspectionId: number,
    adminUserId: number,
    input: {
      scheduledDate?: Date | undefined;
      leadInspectorId?: number | null | undefined;
      committeeMemberIds?: number[] | undefined;
    },
  ) {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: { committeeMembers: { select: { id: true, userId: true } } },
    });

    if (!inspection) {
      throw new Error(`Inspection ${inspectionId} not found`);
    }

    const result = await prisma.$transaction(async (tx) => {
      const data: any = {};
      if (input.scheduledDate !== undefined)
        data.scheduledDate = input.scheduledDate;
      if (input.leadInspectorId !== undefined)
        data.leadInspectorId = input.leadInspectorId ?? null;

      const updatedInspection = await tx.inspection.update({
        where: { id: inspectionId },
        data,
      });

      // Update committee membership if provided
      if (
        input.committeeMemberIds !== undefined ||
        input.leadInspectorId !== undefined
      ) {
        const desiredSet = new Set<number>();
        const leadId =
          input.leadInspectorId !== undefined
            ? input.leadInspectorId
            : inspection.leadInspectorId;
        if (leadId && Number.isFinite(leadId)) desiredSet.add(leadId as number);
        if (Array.isArray(input.committeeMemberIds)) {
          input.committeeMemberIds.forEach((id) => {
            if (Number.isFinite(id)) desiredSet.add(id);
          });
        }

        const desiredIds = Array.from(desiredSet);

        const existing = await tx.inspectionCommittee.findMany({
          where: { inspectionId },
        });
        const existingByUser = new Map<
          number,
          { id: number; userId: number }
        >();
        existing.forEach((row) =>
          existingByUser.set(row.userId, { id: row.id, userId: row.userId }),
        );

        const toAdd = desiredIds.filter((id) => !existingByUser.has(id));
        const toRemove = existing
          .filter((r) => !desiredSet.has(r.userId))
          .map((r) => r.id);

        if (toAdd.length > 0) {
          const users = await tx.user.findMany({
            where: { id: { in: toAdd } },
            select: {
              id: true,
              fullName: true,
              user_roles: {
                include: { roles: { select: { role_name: true } } },
              },
            },
          });

          const committeeData = users.map((user) => ({
            inspectionId,
            userId: user.id,
            expertName: user.fullName || "",
            expertRole:
              user.user_roles[0]?.roles?.role_name || "Field Reviewer",
            signatureUrl: "",
            signedAt: null,
          }));

          if (committeeData.length > 0) {
            await tx.inspectionCommittee.createMany({ data: committeeData });
          }
        }

        if (toRemove.length > 0) {
          await tx.inspectionCommittee.deleteMany({
            where: { id: { in: toRemove } },
          });
        }
      }

      return updatedInspection;
    });

    return result;
  }
}

export default InspectionService;
