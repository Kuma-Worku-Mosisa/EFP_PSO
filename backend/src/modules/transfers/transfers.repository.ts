import prisma from "../../lib/prisma";

export class TransfersRepository {
  async findHrManagersByOrganization(organizationId: number) {
    return prisma.user.findMany({
      where: {
        employee: {
          organizationId: organizationId,
        },
        user_roles: {
          some: {
            roles: {
              role_name: "org_hr_manager",
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });
  }

  async findEmployeeWithCurrentOrg(employeeId: number) {
    return prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, organizationId: true, positionId: true },
    });
  }

  async findEmployeeByIdentifier(query: string) {
    const cleanQuery = query.trim();

    // Try to find by faydaId first (exact match, case-insensitive on SQL Server)
    let employee = await prisma.employee.findFirst({
      where: {
        user: {
          faydaId: cleanQuery,
        },
      },
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
            status: true,
            faydaId: true,
          },
        },
        organization: {
          select: { id: true, nameEnglish: true },
        },
        position: {
          select: { id: true, name: true },
        },
      },
    });

    // If not found by faydaId, try by email
    if (!employee) {
      employee = await prisma.employee.findFirst({
        where: {
          user: {
            email: cleanQuery,
          },
        },
        select: {
          id: true,
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              status: true,
              faydaId: true,
            },
          },
          organization: {
            select: { id: true, nameEnglish: true },
          },
          position: {
            select: { id: true, name: true },
          },
        },
      });
    }

    return employee;
  }

  async findIncomingTransfersForOrganization(organizationId: number) {
    return prisma.transferRequest.findMany({
      where: {
        sourceOrganizationId: organizationId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                faydaId: true,
              },
            },
            position: {
              select: {
                name: true,
              },
            },
          },
        },
        sourceOrganization: { select: { nameEnglish: true } },
        targetOrganization: { select: { nameEnglish: true } },
        position: { select: { name: true } },
      },
    });
  }

  async findCompletedTransfersForOrganization(organizationId: number) {
    return prisma.transferRequest.findMany({
      where: {
        OR: [
          { sourceOrganizationId: organizationId },
          { targetOrganizationId: organizationId },
        ],
        status: {
          not: "PENDING",
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        employee: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                faydaId: true,
              },
            },
            position: {
              select: {
                name: true,
              },
            },
          },
        },
        sourceOrganization: { select: { id: true, nameEnglish: true } },
        targetOrganization: { select: { id: true, nameEnglish: true } },
        position: { select: { name: true } },
      },
    });
  }

  async findTransferRequestById(requestId: number) {
    return prisma.transferRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          include: {
            position: {
              select: { id: true, name: true },
            },
          },
        },
        position: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async createTransferRequest(data: {
    employeeId: number;
    sourceOrganizationId: number;
    targetOrganizationId: number;
    requestedPositionId?: number;
    reason: string;
    initiatedById: number;
  }) {
    return prisma.transferRequest.create({
      data: {
        employeeId: data.employeeId,
        sourceOrganizationId: data.sourceOrganizationId,
        targetOrganizationId: data.targetOrganizationId,
        requestedPositionId: data.requestedPositionId || null,
        reason: data.reason,
        initiatedById: data.initiatedById,
        status: "PENDING",
      },
    });
  }

  async executeApprovalTransaction(
    requestId: number,
    employeeId: number,
    targetOrganizationId: number,
    actionedById: number,
    nextStatus: "SOURCE_RELEASED" | "FULLY_APPROVED",
    updateEmployeeOnSourceRelease = false,
  ) {
    // Reuses global connection instance for transaction grouping safely
    return prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.transferRequest.update({
        where: { id: requestId },
        data: {
          status: nextStatus,
          actionedById: actionedById,
          actionedAt: new Date(),
        },
      });

      let updatedEmployee = null;
      if (
        nextStatus === "FULLY_APPROVED" ||
        (nextStatus === "SOURCE_RELEASED" && updateEmployeeOnSourceRelease)
      ) {
        updatedEmployee = await tx.employee.update({
          where: { id: employeeId },
          data: {
            organizationId: targetOrganizationId,
            employmentStatus: "ACTIVE",
          },
        });
      }

      return { updatedRequest, updatedEmployee };
    });
  }

  async executeRejection(
    requestId: number,
    actionedById: number,
    rejectionReason: string,
  ) {
    return prisma.transferRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        actionedById: actionedById,
        rejectionReason: rejectionReason,
        actionedAt: new Date(),
      },
    });
  }
}
