// src/modules/agreement/agreement.service.ts
import prisma from "../../lib/prisma";
import {
  AgreementSnapshot,
  CreateAgreementDTO,
  UpdateAgreementStatusDTO,
  AgreementFiltersDTO,
} from "./agreement.types";

export class AgreementService {
  private static formatDateTime(value: Date | null) {
    if (!value) return null;
    return value.toISOString().replace("T", " ").replace("Z", "");
  }

  private static resolveOrganizationName(org: any) {
    return org?.nameEnglish || org?.nameAmharic || org?.name || "";
  }
  /**
   * CREATE: Generates a new agreement row and commits a frozen snapshot to VarChar(Max)
   * Automatically supersedes existing active contracts for the given organization.
   */
  static async createOrganizationAgreement(data: CreateAgreementDTO) {
    const { applicationId, recruitmentDeadline } = data;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        organization: {
          include: {
            address: {
              include: {
                kebele: {
                  include: {
                    woreda: {
                      include: {
                        zone: {
                          include: {
                            region: true,
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
                fullName: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!application) throw new Error("Application not found");
    if (!application.organization) throw new Error("Organization not found");
    if (!application.user) throw new Error("Signing user not found");

    const org = application.organization;
    const signingUser = application.user;
    const managerName = application.manager?.user?.fullName || "N/A";

    const deadlineDate = new Date(recruitmentDeadline);

    // Build the structural data payload to snapshot historical context
    const snapshot: AgreementSnapshot = {
      agencyNameEnglish: org.nameEnglish || "N/A",
      agencyNameAmharic: org.nameAmharic || "N/A",
      email: org.email,
      phone: org.phone,
      fax: org.faxNumber || "N/A",
      managerName,
      signedByFullName: signingUser.fullName,
      signedByPhone: signingUser.phone,
      regionEnglish:
        org.address?.kebele?.woreda?.zone?.region?.nameEnglish || "N/A",
      regionAmharic:
        org.address?.kebele?.woreda?.zone?.region?.nameAmharic || "N/A",
      zoneEnglish: org.address?.kebele?.woreda?.zone?.nameEnglish || "N/A",
      zoneAmharic: org.address?.kebele?.woreda?.zone?.nameAmharic || "N/A",
      woredaEnglish: org.address?.kebele?.woreda?.nameEnglish || "N/A",
      woredaAmharic: org.address?.kebele?.woreda?.nameAmharic || "N/A",
      kebeleEnglish: org.address?.kebele?.nameEnglish || "N/A",
      kebeleAmharic: org.address?.kebele?.nameAmharic || "N/A",
      location: org.address?.specialLocation || "N/A",
      number: org.address?.houseNumber || "N/A",
      numberOfOffices: org.numberOfOffices || 0,
      hasOneYearRentContract: org.numberOfOffices
        ? org.numberOfOffices > 0
        : false,
      numberOfVehicles: org.numberOfVehicles || 0,
      numberOfComputers: org.numberOfComputers || 0,
      signedAtDate: new Date().toLocaleDateString("en-GB"),
      date: deadlineDate.toLocaleDateString("en-GB"),
    };

    const issuedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(issuedDate.getFullYear() + 1);
    const uniqueSerial = `EFP-${issuedDate.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Transaction safety step: Supersede any active contracts before launching the new one
    await prisma.agreement.updateMany({
      where: {
        status: "Active",
        application: {
          organizationId: org.id,
        },
      },
      data: { status: "Superseded" },
    });

    // Write to SQL Server database with snapshotData stringified
    const newAgreement = await prisma.agreement.create({
      data: {
        agreementNumber: uniqueSerial,
        applicationId: application.id,
        status: "Active",
        recruitmentDeadline: deadlineDate,
        snapshotData: JSON.stringify(snapshot), // Serialized into String for VarChar(Max) storage
        issuedDate: issuedDate,
        expiryDate: expiryDate,
      },
      include: {
        application: {
          select: {
            organization: {
              select: {
                nameEnglish: true,
                nameAmharic: true,
                tinNumber: true,
              },
            },
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    return {
      ...newAgreement,
      snapshotData: snapshot, // Return as parsed JSON object directly to the controller
      organization: newAgreement.application?.organization
        ? {
            ...newAgreement.application.organization,
            name: AgreementService.resolveOrganizationName(
              newAgreement.application.organization,
            ),
          }
        : null,
      signedBy: newAgreement.application?.user,
    };
  }

  /**
   * READ: Retrieves a clean paginated list of contracts matching filter queries.
   * Maps through records to parse stringified snapshot objects back into standard JSON payloads.
   */
  static async getAllAgreements(
    filters: AgreementFiltersDTO,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (filters.applicationId)
      whereClause.applicationId = filters.applicationId;
    if (filters.organizationId)
      whereClause.application = {
        ...(whereClause.application || {}),
        organizationId: filters.organizationId,
      };
    if (filters.status) whereClause.status = filters.status;

    if (filters.year) {
      whereClause.issuedDate = {
        gte: new Date(`${filters.year}-01-01T00:00:00.000Z`),
        lte: new Date(`${filters.year}-12-31T23:59:59.999Z`),
      };
    }

    const [agreements, total] = await Promise.all([
      prisma.agreement.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          application: {
            select: {
              organization: {
                select: {
                  nameEnglish: true,
                  nameAmharic: true,
                  tinNumber: true,
                },
              },
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      }),
      prisma.agreement.count({ where: whereClause }),
    ]);

    // Map through array items and unpack data values safely
    const parsedAgreements = agreements.map((item) => {
      const organization = item.application?.organization;
      const signedBy = item.application?.user;
      try {
        return {
          ...item,
          snapshotData: JSON.parse(item.snapshotData),
          organization,
          signedBy,
        };
      } catch (e) {
        return {
          ...item,
          snapshotData: {}, // Graceful handling if record was corrupted or missing layout markers
          organization,
          signedBy,
        };
      }
    });

    return {
      agreements: parsedAgreements,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * READ: Locates a single precise historical contract by ID and unpacks its metadata metrics.
   */
  static async getAgreementById(id: number) {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      select: {
        id: true,
        agreementNumber: true,
        status: true,
        snapshotData: true,
        recruitmentDeadline: true,
        issuedDate: true,
        expiryDate: true,
        createdAt: true,
        updatedAt: true,
        applicationId: true,
      },
    });

    if (!agreement) throw new Error("Agreement record not found");

    let snapshot: AgreementSnapshot | Record<string, unknown> = {};
    try {
      snapshot = JSON.parse(agreement.snapshotData);
    } catch {
      snapshot = {};
    }
    return {
      agreement_id: agreement.id,
      agreement_number: agreement.agreementNumber,
      agreement_status: agreement.status,
      snapshot_data: snapshot,
      recruitment_deadline: AgreementService.formatDateTime(
        agreement.recruitmentDeadline,
      ),
      issued_date: AgreementService.formatDateTime(agreement.issuedDate),
      expiry_date: AgreementService.formatDateTime(agreement.expiryDate),
      created_at: AgreementService.formatDateTime(agreement.createdAt),
      updated_at: AgreementService.formatDateTime(agreement.updatedAt),
      application_id: agreement.applicationId,
    };
  }

  /**
   * UPDATE: Updates status state properties.
   * Protects compliance audits by ensuring snapshotData raw code content cannot be modified.
   */
  static async updateAgreementStatus(
    id: number,
    updateData: UpdateAgreementStatusDTO,
  ) {
    const agreement = await prisma.agreement.findUnique({ where: { id } });
    if (!agreement) throw new Error("Agreement record not found");

    const updated = await prisma.agreement.update({
      where: { id },
      data: { status: updateData.status },
      include: {
        application: {
          select: {
            organization: {
              select: {
                nameEnglish: true,
                nameAmharic: true,
              },
            },
            user: { select: { fullName: true } },
          },
        },
      },
    });

    const organization = updated.application?.organization;
    const signedBy = updated.application?.user;
    return {
      ...updated,
      snapshotData: JSON.parse(updated.snapshotData),
      organization: organization
        ? {
            ...organization,
            name: AgreementService.resolveOrganizationName(organization),
          }
        : null,
      signedBy,
    };
  }

  /**
   * DELETE: Implements soft validation overrides (Revocation) inside compliance pipelines.
   * Prevents system failure states when auditing historic business entity profiles.
   */
  static async deleteAgreement(id: number) {
    const agreement = await prisma.agreement.findUnique({ where: { id } });
    if (!agreement) throw new Error("Agreement record not found");

    const revoked = await prisma.agreement.update({
      where: { id },
      data: { status: "Revoked" },
    });

    return {
      ...revoked,
      snapshotData: JSON.parse(revoked.snapshotData),
    };
  }

  /**
   * READ: Fetch the most recent agreement tied to a user's application.
   */
  static async getLatestAgreementByUser(userId: number) {
    const agreement = await prisma.agreement.findFirst({
      where: {
        application: {
          userId,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        application: {
          include: {
            organization: true,
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!agreement) throw new Error("Agreement record not found");

    return {
      ...agreement,
      snapshotData: JSON.parse(agreement.snapshotData),
      organization: agreement.application?.organization,
      signedBy: agreement.application?.user,
    };
  }
}
