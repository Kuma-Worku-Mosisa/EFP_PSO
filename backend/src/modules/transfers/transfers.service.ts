//filepath: backend/src/modules/transfers/transfers.service.ts
import { TransfersRepository } from "./transfers.repository";
import { NotificationService } from "../notification/notification.service";
import { getUsersByRole } from "../user/user.service";
import prisma from "../../lib/prisma";
import {
  isDocumentTypeMatch,
  normalizeDocumentType,
} from "../../utils/documentOrganizer";
import { sendSystemEmail } from "../../utils/emailService";

const SPECIAL_POSITION_APPROVAL_ROLES = ["admin", "super_admin"];
const SPECIAL_POSITIONS = [
  "Manager of Organization",
  "Operation of Organization",
  "Administrative and Finance of Organization",
];

export class TransfersService {
  private repository = new TransfersRepository();

  async initiateTransfer(
    payload: {
      employeeId: number;
      targetOrganizationId: number;
      requestedPositionId?: number;
      reason: string;
      initiatedById: number;
      roles: string[];
    },
    uploadedFiles?: Record<string, string> | null,
  ) {
    const employee = await this.repository.findEmployeeWithCurrentOrg(
      payload.employeeId,
    );
    if (!employee) {
      throw new Error("Target employee profile does not exist.");
    }

    if (employee.organizationId === payload.targetOrganizationId) {
      throw new Error(
        "Employee is already structurally assigned to this target organization.",
      );
    }

    const normalizedEmploymentStatus = String(employee.employmentStatus || "")
      .trim()
      .toLowerCase();
    if (normalizedEmploymentStatus !== "resigned") {
      throw new Error(
        "Only resigned employees may be processed through this transfer workflow.",
      );
    }

    if (employee.isBlacklisted) {
      throw new Error(
        "This employee is blacklisted and cannot be transferred until the blacklist status is cleared.",
      );
    }

    const requiredDocs = [
      "fingerprint_doc",
      "medical_doc",
      "guarantee_doc",
      "resignation_record_doc",
    ];

    const existingDocs = await prisma.employeeDocument.findMany({
      where: { employeeId: payload.employeeId },
      select: { documentType: true },
    });

    const existingTypes = existingDocs.map((d) => d.documentType);
    const missingDocs = requiredDocs.filter(
      (requiredDoc) =>
        !existingTypes.some((existingType) =>
          isDocumentTypeMatch(existingType, requiredDoc),
        ),
    );

    if (
      missingDocs.length > 0 &&
      uploadedFiles &&
      Object.keys(uploadedFiles).length > 0
    ) {
      const docsToCreate: Array<{
        employeeId: number;
        documentType: string;
        fileUrl: string;
      }> = [];

      for (const reqDoc of missingDocs) {
        const matchEntry = Object.entries(uploadedFiles).find(
          ([k]) =>
            k.endsWith(`_${reqDoc}`) || k === reqDoc || k.endsWith(reqDoc),
        );
        if (matchEntry) {
          const [, fileUrl] = matchEntry;
          docsToCreate.push({
            employeeId: payload.employeeId,
            documentType: normalizeDocumentType(reqDoc),
            fileUrl,
          });
        }
      }

      if (docsToCreate.length > 0) {
        await prisma.employeeDocument.createMany({ data: docsToCreate });
      }
    }

    const uploadedDocCount = existingTypes.filter((existingType) =>
      requiredDocs.some((requiredDoc) =>
        isDocumentTypeMatch(existingType, requiredDoc),
      ),
    ).length;

    if (uploadedDocCount < requiredDocs.length) {
      throw new Error(
        "Required resigned employee documents must be uploaded before the transfer request can be submitted.",
      );
    }

    const targetPositionId = payload.requestedPositionId ?? employee.positionId;
    if (!targetPositionId) {
      throw new Error("Target position is required for this transfer request.");
    }

    let targetPositionName = employee.position?.name || "";
    if (
      payload.requestedPositionId &&
      payload.requestedPositionId !== employee.positionId
    ) {
      const targetPosition = await prisma.position.findUnique({
        where: { id: payload.requestedPositionId },
        select: { name: true },
      });
      targetPositionName = targetPosition?.name || targetPositionName;
    }

    const isSpecialPosition = SPECIAL_POSITIONS.some(
      (position) =>
        String(position).trim().toLowerCase() ===
        String(targetPositionName).trim().toLowerCase(),
    );

    let transferRequest;
    let personnelChangeRequest: any = null;

    if (isSpecialPosition) {
      transferRequest = await prisma.transferRequest.create({
        data: {
          employeeId: payload.employeeId,
          sourceOrganizationId: employee.organizationId,
          targetOrganizationId: payload.targetOrganizationId,
          requestedPositionId: targetPositionId,
          reason: payload.reason || "Transfer request",
          initiatedById: payload.initiatedById,
          status: "PENDING",
        },
      });

      personnelChangeRequest = await prisma.personnelChangeRequest.create({
        data: {
          initiatedByUserId: payload.initiatedById,
          targetEmployeeId: payload.employeeId,
          requestType: "EXISTING_EMPLOYEE",
          sourceOrganizationId: employee.organizationId,
          targetOrganizationId: payload.targetOrganizationId,
          targetPositionId: targetPositionId,
          reason: payload.reason || "Transfer request",
          status: "PENDING",
        },
      });
    } else {
      const directTransfer = await this.repository.createDirectTransferRequestAndUpdateEmployee({
        employeeId: payload.employeeId,
        sourceOrganizationId: employee.organizationId,
        targetOrganizationId: payload.targetOrganizationId,
        requestedPositionId: targetPositionId,
        reason: payload.reason || "Transfer request",
        initiatedById: payload.initiatedById,
      });
      transferRequest = directTransfer.transferRequest;
    }

    // Fetch employee details for notification context
    const employeeDetail = await prisma.employee.findUnique({
      where: { id: payload.employeeId },
      include: {
        user: { select: { fullName: true, faydaId: true } },
        organization: { select: { nameEnglish: true, nameAmharic: true } },
      },
    });

    const targetOrg = await prisma.organization.findUnique({
      where: { id: payload.targetOrganizationId },
      select: { nameEnglish: true, nameAmharic: true },
    });

    // Get HR managers from source organization
    const sourceHrManagers = await this.repository.findHrManagersByOrganization(
      employee.organizationId,
    );

    // Get HR managers from destination organization
    const destHrManagers = await this.repository.findHrManagersByOrganization(
      payload.targetOrganizationId,
    );

    // Build notification context
    const notificationContext = {
      organizationName: employeeDetail?.organization?.nameEnglish || "Unknown",
      organizationNameAm:
        employeeDetail?.organization?.nameAmharic || "Unknown",
      currentOrganizationName:
        employeeDetail?.organization?.nameEnglish || "Unknown",
      currentOrganizationNameAm:
        employeeDetail?.organization?.nameAmharic || "Unknown",
      destinationOrganizationName: targetOrg?.nameEnglish || "Unknown",
      destinationOrganizationNameAm: targetOrg?.nameAmharic || "Unknown",
      employeeName: employeeDetail?.user?.fullName || "Unknown",
      faydaId: employeeDetail?.user?.faydaId || "Unknown",
      transferReason: payload.reason || "Transfer Request",
    };

    // Notify source organization HR managers
    for (const manager of sourceHrManagers) {
      if (manager.email) {
        try {
          await NotificationService.sendBilingualAlert(
            manager.id,
            "TRANSFER_REQUEST_INITIATED_SOURCE",
            notificationContext,
          );
        } catch (error) {
          console.error(
            `[Transfer Service] Failed to notify source HR manager ${manager.email}:`,
            error,
          );
        }
      }
    }

    // Notify destination organization HR managers
    for (const manager of destHrManagers) {
      if (manager.email) {
        try {
          await NotificationService.sendBilingualAlert(
            manager.id,
            "TRANSFER_REQUEST_INITIATED_DESTINATION",
            notificationContext,
          );
        } catch (error) {
          console.error(
            `[Transfer Service] Failed to notify destination HR manager ${manager.email}:`,
            error,
          );
        }
      }
    }

    if (isSpecialPosition && personnelChangeRequest) {
      await this.notifyActiveAdminsAboutPersonnelChangeRequest({
        requestId: personnelChangeRequest.id,
        organizationNameEn:
          employeeDetail?.organization?.nameEnglish || "Unknown",
        organizationNameAm:
          employeeDetail?.organization?.nameAmharic || "Unknown",
        employeeName: employeeDetail?.user?.fullName || "Unknown",
      });
    }

    return transferRequest;
  }

  private async notifyActiveAdminsAboutPersonnelChangeRequest(payload: {
    requestId: number;
    organizationNameEn: string;
    organizationNameAm: string;
    employeeName: string;
  }) {
    const adminUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        user_roles: {
          some: {
            roles: {
              role_name: {
                in: ["admin", "super_admin"],
              },
            },
          },
        },
      },
      select: { id: true, fullName: true, email: true },
    });

    const subject = "Leader Change request submitted / የአመራር ለውጥ ጥያቄ ተላከ";
    const portalMessage = `A Leader Change request was submitted for ${payload.employeeName} from ${payload.organizationNameEn}.\n${payload.employeeName} የዝውውር ጥያቄ ከ${payload.organizationNameAm} ተላክቷል።`;
    const emailBody = `A Leader Change request has been submitted for review.\n\nEmployee: ${payload.employeeName}\nOrganization: ${payload.organizationNameEn}\nRequest ID: ${payload.requestId}\n\nPlease review it promptly.\n\nሰራተኛ: ${payload.employeeName}\nድርጅት: ${payload.organizationNameAm}\nጥያቄ መለያ: ${payload.requestId}`;

    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          recipientUserId: admin.id,
          notificationType: "NEW_REQUEST",
          alertTitle: subject,
          alertMessage: portalMessage,
          isReadByRecipient: false,
        },
      });

      if (admin.email) {
        try {
          await sendSystemEmail(admin.email, subject, emailBody);
        } catch (emailError) {
          console.error(
            `[Receive Service] Failed to send personnel-change notification to admin ${admin.id} (${admin.email}):`,
            emailError,
          );
        }
      }
    }
  }

  async lookupEmployee(query: string) {
    const base = await this.repository.findEmployeeByIdentifier(query);
    if (!base) return null;

    // Get fresh employee record including documents to ensure latest URLs
    const employee = await prisma.employee.findUnique({
      where: { id: base.id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
            status: true,
            faydaId: true,
          },
        },
        organization: { select: { id: true, nameEnglish: true } },
        position: { select: { id: true, name: true } },
        documents: {
          select: {
            id: true,
            documentType: true,
            fileUrl: true,
            uploadedAt: true,
            isVerified: true,
          },
        },
      },
    });

    if (!employee) return null;

    return {
      id: employee.id,
      faydaId: employee.user.faydaId,
      isBlacklisted: employee.isBlacklisted,
      employmentStatus: employee.employmentStatus || "",
      user: {
        fullName: employee.user.fullName,
        email: employee.user.email,
        phone: employee.user.phone || "",
        status: employee.user.status,
      },
      organization: {
        id: employee.organization?.id || 0,
        name: employee.organization?.nameEnglish || "Unknown",
      },
      position: employee.position
        ? { id: employee.position.id, name: employee.position.name }
        : { id: 0, name: "Unassigned" },
      documents: (employee.documents || []).map((d) => ({
        id: d.id,
        type: d.documentType,
        url: d.fileUrl,
        uploadedAt: d.uploadedAt,
        isVerified: d.isVerified,
      })),
    };
  }

  async getIncomingPendingRequests(organizationId: number) {
    return this.repository.findIncomingTransfersForOrganization(organizationId);
  }

  async getTransferHistoryForOrganization(organizationId: number) {
    return this.repository.findCompletedTransfersForOrganization(
      organizationId,
    );
  }

  async processTransferDecision(
    requestId: number,
    action: "REJECT",
    actionedById: number,
    userOrganizationId: number,
    roles: string[],
    rejectionReason?: string,
  ) {
    const request = await this.repository.findTransferRequestById(requestId);
    if (!request) {
      throw new Error("The transfer request file could not be found.");
    }

    const normalizedRoles = (roles || []).map((role) =>
      String(role).trim().toLowerCase(),
    );

    if (request.status === "FULLY_APPROVED" || request.status === "REJECTED") {
      throw new Error(
        "This request transaction has already been closed and finalized.",
      );
    }

    // Fetch details for notifications
    const employeeDetail = await prisma.employee.findUnique({
      where: { id: request.employeeId },
      include: {
        user: { select: { fullName: true, faydaId: true } },
        organization: { select: { nameEnglish: true, nameAmharic: true } },
        position: { select: { id: true, name: true } },
      },
    });

    const targetOrg = await prisma.organization.findUnique({
      where: { id: request.targetOrganizationId },
      select: { nameEnglish: true, nameAmharic: true },
    });

    const sourceOrg = await prisma.organization.findUnique({
      where: { id: request.sourceOrganizationId },
      select: { nameEnglish: true, nameAmharic: true },
    });

    const notificationContext = {
      organizationName: sourceOrg?.nameEnglish || "Unknown",
      organizationNameAm: sourceOrg?.nameAmharic || "Unknown",
      currentOrganizationName: sourceOrg?.nameEnglish || "Unknown",
      currentOrganizationNameAm: sourceOrg?.nameAmharic || "Unknown",
      destinationOrganizationName: targetOrg?.nameEnglish || "Unknown",
      destinationOrganizationNameAm: targetOrg?.nameAmharic || "Unknown",
      employeeName: employeeDetail?.user?.fullName || "Unknown",
      faydaId: employeeDetail?.user?.faydaId || "Unknown",
      transferReason: request.reason || "Receive Request",
    };

    if (action === "REJECT") {
      if (!rejectionReason) {
        throw new Error("A rejection reason must be provided.");
      }
      if (
        userOrganizationId !== request.sourceOrganizationId &&
        userOrganizationId !== request.targetOrganizationId
      ) {
        throw new Error(
          "Authorization failure. Only source or destination organizations may reject this transfer.",
        );
      }

      const result = await this.repository.executeRejection(
        request.id,
        actionedById,
        rejectionReason,
      );

      // Notify both source and destination HR managers of rejection
      const sourceHrManagers =
        await this.repository.findHrManagersByOrganization(
          request.sourceOrganizationId,
        );
      const destHrManagers = await this.repository.findHrManagersByOrganization(
        request.targetOrganizationId,
      );

      const rejectionContext = {
        ...notificationContext,
        customDetailsAm: rejectionReason, // Use this field for rejection reason
      };

      for (const manager of [...sourceHrManagers, ...destHrManagers]) {
        if (manager.email) {
          try {
            await NotificationService.sendBilingualAlert(
              manager.id,
              "TRANSFER_REQUEST_REJECTED",
              rejectionContext,
            );
            console.log(
              `[Transfer Service] Rejection notification sent to: ${manager.email}`,
            );
          } catch (error) {
            console.error(
              `[Transfer Service] Failed to notify on rejection ${manager.email}:`,
              error,
            );
          }
        }
      }

      return result;
    }
  }
}
