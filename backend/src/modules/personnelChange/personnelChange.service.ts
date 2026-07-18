import prisma from "../../lib/prisma";
import {
  registerEmployee,
  EmployeeRegistrationInput,
} from "../employee/employee.service";
import { createAuditLog } from "../../utils/auditLogger";
import { sendSystemEmail } from "../../utils/emailService";

const SPECIAL_POSITION_NAMES = [
  "Manager of Organization",
  "Operation of Organization",
  "Administrative and Finance of Organization",
];

const isSpecialPositionName = (name: string | null | undefined) => {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  return SPECIAL_POSITION_NAMES.some(
    (specialName) => normalized === specialName.toLowerCase(),
  );
};

const normalizeRequestType = (value: unknown) =>
  String(value || "")
    .trim()
    .toUpperCase();

const resolveExistingEmployeeForRequest = async (payload: any) => {
  const directEmployeeId = Number(
    payload.targetEmployeeId || payload.employeeId || 0,
  );
  if (directEmployeeId > 0) {
    const directEmployee = await prisma.employee.findUnique({
      where: { id: directEmployeeId },
      include: { user: true, organization: true, documents: true },
    });
    if (directEmployee) return directEmployee;
  }

  const searchTerms = [payload.faydaId, payload.email, payload.phone]
    .filter((value): value is string => Boolean(String(value || "").trim()))
    .map((value) => String(value).trim());

  if (searchTerms.length > 0) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(payload.faydaId
            ? [{ faydaId: String(payload.faydaId).trim() }]
            : []),
          ...(payload.email ? [{ email: String(payload.email).trim() }] : []),
          ...(payload.phone ? [{ phone: String(payload.phone).trim() }] : []),
        ],
      },
      select: { id: true },
    });

    if (user?.id) {
      return prisma.employee.findUnique({
        where: { userId: user.id },
        include: { user: true, organization: true, documents: true },
      });
    }
  }

  return null;
};

const notifyAdminsAboutPersonnelChangeRequest = async (
  organizationNameEn: string,
  organizationNameAm: string,
  employeeName: string,
  requestType: string,
) => {
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

  const emailSubject =
    requestType === "EXISTING_EMPLOYEE"
      ? "Existing Employee Personnel Change Request / ነባር ሰራተኛ ለውጥ ጥያቄ"
      : "New Personnel Change Request / አዲስ የሰራተኛ ለውጥ ጥያቄ";
  const portalMessage =
    requestType === "EXISTING_EMPLOYEE"
      ? `A personnel change request was submitted for ${organizationNameEn} for employee ${employeeName}. \nለ${organizationNameAm} ለ${employeeName} የሰራተኛ ለውጥ ጥያቄ ተላከ።`
      : `A new personnel change request was submitted for ${organizationNameEn} with employee ${employeeName}. \nለ${organizationNameAm} እና ${employeeName} አዲስ የሰራተኛ ለውጥ ጥያቄ ተላከ።`;
  const emailBody =
    requestType === "EXISTING_EMPLOYEE"
      ? `A personnel change request has been submitted for review.\n\nOrganization: ${organizationNameEn}\nEmployee: ${employeeName}\n\nPlease review and proceed.\n\nድርጅት: ${organizationNameAm}\nሰራተኛ: ${employeeName}`
      : `A new personnel change request has been submitted.\n\nOrganization: ${organizationNameEn}\nEmployee: ${employeeName}\n\nPlease review and proceed.\n\nድርጅት: ${organizationNameAm}\nሰራተኛ: ${employeeName}`;

  for (const admin of adminUsers) {
    await prisma.notification.create({
      data: {
        recipientUserId: admin.id,
        notificationType: "NEW_REQUEST",
        alertTitle: emailSubject,
        alertMessage: portalMessage,
        isReadByRecipient: false,
      },
    });

    if (admin.email) {
      try {
        await sendSystemEmail(admin.email, emailSubject, emailBody);
      } catch (emailError) {
        console.error(
          `[PersonnelChange] Failed to send request email to admin ${admin.id} (${admin.email}):`,
          emailError,
        );
      }
    }
  }
};

export const PersonnelChangeService = {
  createNewEmployeeRequest: async (
    payload: any,
    actorUserId: number | null,
  ) => {
    if (!actorUserId) {
      throw new Error(
        "User authentication required to create personnel change request",
      );
    }

    const normalizedRequestType = normalizeRequestType(payload.requestType);
    const requestedPositionId = payload.positionId
      ? Number(payload.positionId)
      : null;

    let positionName: string | null = null;
    if (requestedPositionId) {
      const position = await prisma.position.findUnique({
        where: { id: requestedPositionId },
        select: { name: true },
      });
      positionName = position?.name ?? null;
    }

    const explicitRequestType =
      normalizedRequestType === "EXISTING_EMPLOYEE" ||
      normalizedRequestType === "NEW_EMPLOYEE"
        ? normalizedRequestType
        : null;

    const requestType =
      explicitRequestType ??
      (isSpecialPositionName(positionName || payload.positionName)
        ? "EXISTING_EMPLOYEE"
        : "NEW_EMPLOYEE");

    if (requestType === "EXISTING_EMPLOYEE") {
      const targetEmployee = await resolveExistingEmployeeForRequest(payload);
      if (!targetEmployee) {
        throw new Error(
          "Existing employee was not found for this personnel change request.",
        );
      }

      const targetOrganizationId = Number(
        payload.targetOrganizationId ||
          payload.organizationId ||
          targetEmployee.organizationId ||
          0,
      );
      const sourceOrganizationId = Number(
        targetEmployee.organizationId || payload.organizationId || 0,
      );

      if (!requestedPositionId) {
        throw new Error(
          "Target position is required for personnel change request",
        );
      }

      const pcr = await prisma.personnelChangeRequest.create({
        data: {
          initiatedByUserId: actorUserId,
          targetEmployeeId: targetEmployee.id,
          requestType: "EXISTING_EMPLOYEE",
          sourceOrganizationId,
          targetOrganizationId,
          targetPositionId: requestedPositionId,
          reason: payload.reason ?? null,
          status: "PENDING",
        },
      });

      await createAuditLog(prisma, {
        userId: actorUserId,
        action: "CREATE",
        entityName: "PersonnelChangeRequest",
        entityId: pcr.id,
        oldValue: null,
        newValue: JSON.stringify(pcr),
        ipAddress: null,
        userAgent: null,
      });

      const organization = await prisma.organization.findUnique({
        where: { id: targetOrganizationId },
        select: {
          nameEnglish: true,
          nameAmharic: true,
        },
      });

      const employeeName = targetEmployee.user?.fullName || "an employee";
      const orgNameEn = organization?.nameEnglish || "the organization";
      const orgNameAm = organization?.nameAmharic || "ድርጅት";

      await notifyAdminsAboutPersonnelChangeRequest(
        orgNameEn,
        orgNameAm,
        employeeName,
        "EXISTING_EMPLOYEE",
      );

      return {
        personnelChangeRequest: pcr,
        user: targetEmployee.user,
        employee: targetEmployee,
        documents: targetEmployee.documents || [],
      };
    }

    const required = [
      "username",
      "fullName",
      "email",
      "phone",
      "faydaId",
      "organizationId",
      "kebeleId",
    ];
    for (const r of required) {
      if (!payload[r]) throw new Error(`Missing required field: ${r}`);
    }

    const registrationInput: EmployeeRegistrationInput = {
      username: String(payload.username),
      fullName: String(payload.fullName),
      email: String(payload.email),
      phone: String(payload.phone),
      password: String(
        payload.password || Math.random().toString(36).slice(2, 10),
      ),
      faydaId: String(payload.faydaId),
      positionId: requestedPositionId ?? null,
      educationLevel: payload.educationLevel ?? null,
      workExpYears: payload.workExpYears ?? null,
      TotalExpYears: payload.TotalExpYears ?? null,
      gender: payload.gender ?? null,
      citizenship: payload.citizenship ?? null,
      age: payload.age ?? null,
      employmentStatus: "PENDING",
      startedDate: payload.startedDate ?? null,
      organizationId: Number(payload.organizationId),
      kebeleId: Number(payload.kebeleId),
      houseNo: payload.houseNo ?? null,
      specialLocation: payload.specialLocation ?? null,
      uploadedFiles: payload.uploadedFiles ?? {},
    };

    const normalizeUploadedFiles = (
      filesMap: Record<string, string> | undefined,
    ) => {
      const out: Record<string, string> = {};
      const validRoles = [
        "organization",
        "manager",
        "operations",
        "administrator",
        "security_guard",
      ];

      if (!filesMap) return out;

      for (const [key, rawUrl] of Object.entries(filesMap)) {
        if (!rawUrl) continue;
        let url = String(rawUrl || "").trim();
        try {
          if (/^https?:\/\//i.test(url)) {
            const u = new URL(url);
            url = u.pathname + u.search + u.hash;
          }
        } catch (e) {
          // ignore and keep original
        }

        url = url.replace(/^\/+/, "");

        out[key] = url.startsWith("uploads/") ? url : `uploads/${url}`;

        for (const role of validRoles) {
          const prefix = `${role}_`;
          if (key.startsWith(prefix)) {
            const unpref = key.slice(prefix.length);
            if (!out[unpref]) out[unpref] = out[key];
            break;
          }
        }
      }

      return out;
    };

    registrationInput.uploadedFiles = normalizeUploadedFiles(
      registrationInput.uploadedFiles as any,
    );

    if (!registrationInput.positionId) {
      throw new Error(
        "Target position is required for personnel change request",
      );
    }

    const result = await registerEmployee(registrationInput, actorUserId);

    const pcr = await prisma.personnelChangeRequest.create({
      data: {
        initiatedByUserId: actorUserId,
        targetEmployeeId: result.employee.id,
        requestType: "NEW_EMPLOYEE",
        sourceOrganizationId: registrationInput.organizationId,
        targetOrganizationId: registrationInput.organizationId,
        targetPositionId: registrationInput.positionId,
        reason: payload.reason ?? null,
        status: "PENDING",
      },
    });

    await createAuditLog(prisma, {
      userId: actorUserId,
      action: "CREATE",
      entityName: "PersonnelChangeRequest",
      entityId: pcr.id,
      oldValue: null,
      newValue: JSON.stringify(pcr),
      ipAddress: null,
      userAgent: null,
    });

    const organization = await prisma.organization.findUnique({
      where: { id: registrationInput.organizationId },
      select: {
        nameEnglish: true,
        nameAmharic: true,
      },
    });

    const employeeName = result.user.fullName || "an employee";
    const orgNameEn = organization?.nameEnglish || "the organization";
    const orgNameAm = organization?.nameAmharic || "ድርጅት";

    await notifyAdminsAboutPersonnelChangeRequest(
      orgNameEn,
      orgNameAm,
      employeeName,
      "NEW_EMPLOYEE",
    );

    return {
      personnelChangeRequest: pcr,
      user: result.user,
      employee: result.employee,
      documents: result.documents,
    };
  },

  getPersonnelChangeRequests: async (organizationId?: number) => {
    try {
      // Fetch personnel change requests with full related data
      let requests = await prisma.personnelChangeRequest.findMany({
        where: organizationId
          ? { sourceOrganizationId: organizationId }
          : undefined,
        include: {
          initiator: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
            },
          },
          targetEmployee: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  faydaId: true,
                },
              },
              organization: {
                select: {
                  id: true,
                  nameEnglish: true,
                  nameAmharic: true,
                },
              },
              address: {
                include: {
                  kebele: {
                    select: {
                      nameEnglish: true,
                      nameAmharic: true,
                      woreda: {
                        select: {
                          nameEnglish: true,
                          nameAmharic: true,
                          zone: {
                            select: {
                              nameEnglish: true,
                              nameAmharic: true,
                              region: {
                                select: {
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
              documents: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const organizationIds = Array.from(
        new Set(
          requests
            .flatMap((req) => [
              req.targetOrganizationId,
              req.sourceOrganizationId,
            ])
            .filter((id): id is number => typeof id === "number"),
        ),
      );

      const organizations = await prisma.organization.findMany({
        where: {
          id: { in: organizationIds },
        },
        select: {
          id: true,
          nameEnglish: true,
          nameAmharic: true,
        },
      });

      const organizationMap = new Map(
        organizations.map((org) => [org.id, org]),
      );

      requests = requests.map((req) => ({
        ...req,
        targetOrganizationName:
          organizationMap.get(req.targetOrganizationId)?.nameEnglish || null,
        targetOrganizationNameAm:
          organizationMap.get(req.targetOrganizationId)?.nameAmharic || null,
        sourceOrganizationName:
          organizationMap.get(req.sourceOrganizationId)?.nameEnglish || null,
        sourceOrganizationNameAm:
          organizationMap.get(req.sourceOrganizationId)?.nameAmharic || null,
      }));

      const positionIds = Array.from(
        new Set(
          requests
            .map((req) => req.targetPositionId)
            .filter((id): id is number => typeof id === "number"),
        ),
      );

      const positions = await prisma.position.findMany({
        where: {
          id: { in: positionIds },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const positionMap = new Map(positions.map((pos) => [pos.id, pos.name]));

      const excludedEmployeeIds = requests
        .map((req) => req.targetEmployeeId)
        .filter((id): id is number => typeof id === "number");
      const orgIds = Array.from(
        new Set(
          requests
            .map((req) => req.targetOrganizationId)
            .filter((id): id is number => typeof id === "number"),
        ),
      );

      const previousEmployees = await prisma.employee.findMany({
        where: {
          positionId: { in: positionIds },
          organizationId: { in: orgIds },
          id: { notIn: excludedEmployeeIds },
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      });

      const previousPersonMap = new Map<string, string>();
      for (const employee of previousEmployees) {
        if (!employee.positionId || !employee.organizationId) continue;
        const key = `${employee.organizationId}:${employee.positionId}`;
        const name = employee.user?.fullName || "";
        if (!name) continue;
        if (
          !previousPersonMap.has(key) ||
          employee.employmentStatus === "ACTIVE"
        ) {
          previousPersonMap.set(key, name);
        }
      }

      return requests.map((req) => ({
        ...req,
        targetPositionName: positionMap.get(req.targetPositionId) || null,
        previousPersonName:
          previousPersonMap.get(
            `${req.targetOrganizationId}:${req.targetPositionId}`,
          ) || "",
      }));
    } catch (error: any) {
      console.error("getPersonnelChangeRequests error", error);
      throw error;
    }
  },

  approvePersonnelChangeRequest: async (
    requestId: number,
    actorUserId: number | null,
  ) => {
    if (!actorUserId) {
      throw new Error(
        "Authentication required to approve personnel change requests",
      );
    }

    const existing = await prisma.personnelChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        targetEmployee: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
            documents: true,
          },
        },
        initiator: true,
      },
    });

    if (!existing) {
      throw new Error("Personnel change request not found.");
    }

    if (existing.status !== "PENDING") {
      throw new Error(
        `Cannot approve a personnel change request with status ${existing.status}.`,
      );
    }

    const documents = existing.targetEmployee.documents || [];
    const unverifiedDocuments = documents.filter((doc) => !doc.isVerified);

    if (documents.length === 0 || unverifiedDocuments.length > 0) {
      throw new Error(
        "Cannot approve personnel change request until all employee documents are verified.",
      );
    }

    // Update target employee status, organization, and target position
    const targetEmployeeId = existing.targetEmployeeId;
    const targetPositionId = existing.targetPositionId;
    const targetOrganizationId = existing.targetOrganizationId;

    const targetEmployee = await prisma.employee.findUnique({
      where: { id: targetEmployeeId },
      select: { userId: true },
    });

    await prisma.employee.update({
      where: { id: targetEmployeeId },
      data: {
        employmentStatus: "ACTIVE",
        organizationId: targetOrganizationId,
        positionId: targetPositionId,
      },
    });

    if (targetEmployee?.userId) {
      await prisma.user.update({
        where: { id: targetEmployee.userId },
        data: { status: "ACTIVE" },
      });
    }

    // Terminate any previous ACTIVE employee with the same target position in the target organization.
    let previousActiveEmployees: Array<{ id: number; userId: number }> = [];
    if (targetPositionId && targetOrganizationId) {
      previousActiveEmployees = await prisma.employee.findMany({
        where: {
          positionId: targetPositionId,
          organizationId: targetOrganizationId,
          employmentStatus: "ACTIVE",
          id: { not: targetEmployeeId },
        },
        select: { id: true, userId: true },
      });

      await prisma.employee.updateMany({
        where: {
          positionId: targetPositionId,
          organizationId: targetOrganizationId,
          employmentStatus: "ACTIVE",
          id: { not: targetEmployeeId },
        },
        data: {
          employmentStatus: "Resigned",
        },
      });
    }

    for (const previousEmployee of previousActiveEmployees) {
      await prisma.user.update({
        where: { id: previousEmployee.userId },
        data: { status: "INACTIVE" },
      });
    }

    const updated = await prisma.personnelChangeRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
      },
    });

    await createAuditLog(prisma, {
      userId: actorUserId,
      action: "APPROVE",
      entityName: "PersonnelChangeRequest",
      entityId: requestId,
      oldValue: JSON.stringify(existing),
      newValue: JSON.stringify(updated),
      ipAddress: null,
      userAgent: null,
    });

    // Create notification for the initiator
    if (existing.initiatedByUserId) {
      await prisma.notification.create({
        data: {
          recipientUserId: existing.initiatedByUserId,
          notificationType: "APPROVED",
          alertTitle: "Personnel Change Request Approved",
          alertMessage: `Your personnel change request for ${existing.targetEmployee?.user?.fullName || "an employee"} has been approved.`,
          isReadByRecipient: false,
        },
      });
    }

    return updated;
  },

  verifyPersonnelChangeDocument: async (
    requestId: number,
    documentId: number,
    actorUserId: number | null,
  ) => {
    if (!actorUserId) {
      throw new Error(
        "Authentication required to verify personnel change documents",
      );
    }

    const existing = await prisma.personnelChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        targetEmployee: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!existing) {
      throw new Error("Personnel change request not found.");
    }

    if (existing.status !== "PENDING") {
      throw new Error(
        `Cannot verify documents for a personnel change request with status ${existing.status}.`,
      );
    }

    const document = existing.targetEmployee.documents?.find(
      (doc) => doc.id === documentId,
    );

    if (!document) {
      throw new Error("Document not found for this personnel change request.");
    }

    const updated = await prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await createAuditLog(prisma, {
      userId: actorUserId,
      action: "VERIFY",
      entityName: "EmployeeDocument",
      entityId: documentId,
      oldValue: JSON.stringify(document),
      newValue: JSON.stringify(updated),
      ipAddress: null,
      userAgent: null,
    });

    return updated;
  },

  unverifyPersonnelChangeDocument: async (
    requestId: number,
    documentId: number,
    actorUserId: number | null,
  ) => {
    if (!actorUserId) {
      throw new Error(
        "Authentication required to unverify personnel change documents",
      );
    }

    const existing = await prisma.personnelChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        targetEmployee: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!existing) {
      throw new Error("Personnel change request not found.");
    }

    if (existing.status !== "PENDING") {
      throw new Error(
        `Cannot unverify documents for a personnel change request with status ${existing.status}.`,
      );
    }

    const document = existing.targetEmployee.documents?.find(
      (doc) => doc.id === documentId,
    );

    if (!document) {
      throw new Error("Document not found for this personnel change request.");
    }

    const updated = await prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        isVerified: false,
        verifiedAt: null,
      },
    });

    await createAuditLog(prisma, {
      userId: actorUserId,
      action: "UNVERIFY",
      entityName: "EmployeeDocument",
      entityId: documentId,
      oldValue: JSON.stringify(document),
      newValue: JSON.stringify(updated),
      ipAddress: null,
      userAgent: null,
    });

    return updated;
  },

  rejectPersonnelChangeRequest: async (
    requestId: number,
    actorUserId: number | null,
    reason: string,
  ) => {
    if (!actorUserId) {
      throw new Error(
        "Authentication required to reject personnel change requests",
      );
    }

    const existing = await prisma.personnelChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        targetEmployee: {
          include: {
            user: true,
          },
        },
        initiator: true,
      },
    });

    if (!existing) {
      throw new Error("Personnel change request not found.");
    }

    if (existing.status !== "PENDING") {
      throw new Error(
        `Cannot reject a personnel change request with status ${existing.status}.`,
      );
    }

    const updateData: any = {
      status: "REJECTED",
      adminFeedback: reason,
    };

    const updated = await prisma.personnelChangeRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    if (existing.targetEmployeeId) {
      const employeeUpdateData: any = {
        employmentStatus: "Rejected",
      };
      if (existing.targetPositionId) {
        employeeUpdateData.positionId = existing.targetPositionId;
      }

      await prisma.employee.update({
        where: { id: existing.targetEmployeeId },
        data: employeeUpdateData,
      });
    }

    await createAuditLog(prisma, {
      userId: actorUserId,
      action: "REJECT",
      entityName: "PersonnelChangeRequest",
      entityId: requestId,
      oldValue: JSON.stringify(existing),
      newValue: JSON.stringify(updated),
      ipAddress: null,
      userAgent: null,
    });

    // Create notification for the initiator
    if (existing.initiatedByUserId) {
      const reasonSummary = reason.substring(0, 100);
      await prisma.notification.create({
        data: {
          recipientUserId: existing.initiatedByUserId,
          notificationType: "REJECTED",
          alertTitle: "Personnel Change Request Rejected",
          alertMessage: `Your personnel change request for ${existing.targetEmployee?.user?.fullName || "an employee"} has been rejected. Reason: ${reasonSummary}${reason.length > 100 ? "..." : ""}`,
          isReadByRecipient: false,
        },
      });
    }

    return updated;
  },
};
