import { TransfersRepository } from "./transfers.repository";
import { NotificationService } from "../notification/notification.service";
import prisma from "../../lib/prisma";

export class TransfersService {
  private repository = new TransfersRepository();

  async initiateTransfer(payload: {
    employeeId: number;
    targetOrganizationId: number;
    requestedPositionId?: number;
    reason: string;
    initiatedById: number;
  }) {
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

    const transferRequest = await this.repository.createTransferRequest({
      employeeId: payload.employeeId,
      sourceOrganizationId: employee.organizationId,
      targetOrganizationId: payload.targetOrganizationId,
      requestedPositionId:
        payload.requestedPositionId ?? employee.positionId ?? undefined,
      reason: payload.reason,
      initiatedById: payload.initiatedById,
    });

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
          console.log(
            `[Transfer Service] Notification sent to source HR manager: ${manager.email}`,
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
          console.log(
            `[Transfer Service] Notification sent to destination HR manager: ${manager.email}`,
          );
        } catch (error) {
          console.error(
            `[Transfer Service] Failed to notify destination HR manager ${manager.email}:`,
            error,
          );
        }
      }
    }

    return transferRequest;
  }

  async lookupEmployee(query: string) {
    const employee = await this.repository.findEmployeeByIdentifier(query);
    if (!employee) return null;

    return {
      id: employee.id,
      faydaId: employee.user.faydaId,
      user: {
        fullName: employee.user.fullName,
        email: employee.user.email,
        phone: employee.user.phone || "",
        status: employee.user.status,
      },
      organization: {
        id: employee.organization?.id || 0,
        name:
          employee.organization?.nameEnglish ||
          employee.organization?.nameAmharic ||
          "Unknown",
      },
      position: employee.position
        ? { id: employee.position.id, name: employee.position.name }
        : { id: 0, name: "Unassigned" },
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
    action: "RELEASE" | "FINALIZE_APPROVE" | "REJECT",
    actionedById: number,
    userOrganizationId: number,
    rejectionReason?: string,
  ) {
    const request = await this.repository.findTransferRequestById(requestId);
    if (!request) {
      throw new Error("The transfer request file could not be found.");
    }

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
      transferReason: request.reason || "Transfer Request",
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

    if (action === "RELEASE") {
      if (request.sourceOrganizationId !== userOrganizationId) {
        throw new Error(
          "Authorization failure. Only the source organization may release the requested employee.",
        );
      }
      if (request.status !== "PENDING") {
        throw new Error(
          "Cannot release an employee for a transfer request that is not pending.",
        );
      }

      const result = await this.repository.executeApprovalTransaction(
        request.id,
        request.employeeId,
        request.targetOrganizationId,
        actionedById,
        "SOURCE_RELEASED",
      );

      // Notify destination organization HR managers of release
      const destHrManagers = await this.repository.findHrManagersByOrganization(
        request.targetOrganizationId,
      );

      for (const manager of destHrManagers) {
        if (manager.email) {
          try {
            await NotificationService.sendBilingualAlert(
              manager.id,
              "TRANSFER_REQUEST_RELEASED",
              notificationContext,
            );
            console.log(
              `[Transfer Service] Release notification sent to destination HR: ${manager.email}`,
            );
          } catch (error) {
            console.error(
              `[Transfer Service] Failed to notify destination on release ${manager.email}:`,
              error,
            );
          }
        }
      }

      return result;
    }

    if (action === "FINALIZE_APPROVE") {
      if (request.targetOrganizationId !== userOrganizationId) {
        throw new Error(
          "Authorization failure. Only the destination organization may finalize this transfer.",
        );
      }
      if (request.status !== "SOURCE_RELEASED") {
        throw new Error(
          "Cannot fully approve a transfer that has not yet been released by the source organization.",
        );
      }

      const result = await this.repository.executeApprovalTransaction(
        request.id,
        request.employeeId,
        request.targetOrganizationId,
        actionedById,
        "FULLY_APPROVED",
      );

      // Notify both source and destination HR managers of final approval
      const sourceHrManagers =
        await this.repository.findHrManagersByOrganization(
          request.sourceOrganizationId,
        );
      const destHrManagers = await this.repository.findHrManagersByOrganization(
        request.targetOrganizationId,
      );

      for (const manager of [...sourceHrManagers, ...destHrManagers]) {
        if (manager.email) {
          try {
            await NotificationService.sendBilingualAlert(
              manager.id,
              "TRANSFER_REQUEST_APPROVED",
              notificationContext,
            );
            console.log(
              `[Transfer Service] Final approval notification sent to: ${manager.email}`,
            );
          } catch (error) {
            console.error(
              `[Transfer Service] Failed to notify on final approval ${manager.email}:`,
              error,
            );
          }
        }
      }

      return result;
    }
  }
}
