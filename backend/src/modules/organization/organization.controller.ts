import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";

/**
 * Returns a list of organizations with lightweight aggregate counts.
 */
export const getOrganizationsHandler = async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        nameEnglish: true,
        nameAmharic: true,
        email: true,
        phone: true,
        capitalAmount: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            branches: true,
            employees: true,
            serviceContracts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all organization logos in a single query
    const orgLogos = await prisma.organizationDocument.findMany({
      where: { documentType: "Organization Logo" },
      select: {
        organizationId: true,
        fileUrl: true,
      },
    });

    // Map logos by organizationId for quick lookup
    const logoMap = new Map(
      orgLogos.map((doc) => [doc.organizationId, doc.fileUrl]),
    );

    // Map to simpler client-friendly shape
    const payload = organizations.map((o) => ({
      id: o.id,
      nameEnglish: o.nameEnglish,
      nameAmharic: o.nameAmharic,
      email: o.email,
      phone: o.phone,
      capitalAmount: o.capitalAmount,
      status: o.status,
      createdAt: o.createdAt,
      totalBranches: o._count?.branches ?? 0,
      totalEmployees: o._count?.employees ?? 0,
      totalServiceContracts: o._count?.serviceContracts ?? 0,
      logoUrl: logoMap.get(o.id) ?? null,
    }));

    return ApiResponse.success(res, "Organizations retrieved", payload);
  } catch (error: any) {
    console.error("Get Organizations Error:", error?.message ?? error);
    return ApiResponse.error(
      res,
      "Failed to fetch organizations",
      500,
      error?.message ?? String(error),
    );
  }
};

/**
 * Fetch detailed organization data with all related records
 * (employees, incidents, contracts, training, education stats, documents)
 */
export const getOrganizationDetailsHandler = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return ApiResponse.error(res, "Invalid organization id", 400);
  }

  try {
    const formatNestedAddress = (address: any) => {
      if (!address) return "N/A";

      return (
        [
          address.specialLocation,
          address.houseNumber ? `House ${address.houseNumber}` : undefined,
          address.kebele ? `Kebele ${address.kebele.nameEnglish}` : undefined,
          address.kebele?.woreda
            ? `Woreda ${address.kebele.woreda.nameEnglish}`
            : undefined,
          address.kebele?.woreda?.zone
            ? `Zone ${address.kebele.woreda.zone.nameEnglish}`
            : undefined,
          address.kebele?.woreda?.zone?.region
            ? `Region ${address.kebele.woreda.zone.region.nameEnglish}`
            : undefined,
        ]
          .filter(Boolean)
          .join(", ") || "N/A"
      );
    };

    // Fetch organization with basic fields
    const org = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        nameEnglish: true,
        nameAmharic: true,
        email: true,
        phone: true,
        capitalAmount: true,
        status: true,
        createdAt: true,
        tinNumber: true,
        numberOfOffices: true,
        numberOfVehicles: true,
        numberOfComputers: true,
        hasStoreHouse: true,
        _count: {
          select: {
            branches: true,
            employees: true,
            serviceContracts: true,
          },
        },
      },
    });

    if (!org) {
      return ApiResponse.error(res, "Organization not found", 404);
    }

    // Fetch employees with full details
    const employees = await prisma.employee.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        positionId: true,
        addressId: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        position: {
          select: {
            name: true,
          },
        },
        address: {
          select: {
            houseNumber: true,
            specialLocation: true,
            kebele: {
              select: {
                nameEnglish: true,
                woreda: {
                  select: {
                    nameEnglish: true,
                    zone: {
                      select: {
                        nameEnglish: true,
                        region: {
                          select: {
                            nameEnglish: true,
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
        gender: true,
        citizenship: true,
        age: true,
        educationLevel: true,
        workExpYears: true,
        isBlacklisted: true,
        employmentStatus: true,
        employmentStartDate: true,
      },
    });

    // Fetch incidents with penalties
    const incidents = await prisma.incidentReport.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        crimeCategory: true,
        incidentDate: true,
        locationOfIncident: true,
        incidentDescription: true,
        reportedAt: true,
        isReportedWithin24h: true,
        localPoliceStation: true,
        localPoliceRefNumber: true,
        federalPoliceStatus: true,
        penalties: {
          select: {
            id: true,
            penaltyType: true,
            amount: true,
            description: true,
            issuedDate: true,
          },
        },
      },
    });

    // Fetch service contracts
    const serviceContracts = await prisma.serviceContract.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        serviceUserName: true,
        contractUrl: true,
        assignedPersonnelCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        address: {
          select: {
            houseNumber: true,
            specialLocation: true,
            kebele: {
              select: {
                nameEnglish: true,
                woreda: {
                  select: {
                    nameEnglish: true,
                    zone: {
                      select: {
                        nameEnglish: true,
                        region: {
                          select: {
                            nameEnglish: true,
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
    });

    // Fetch training details
    const trainingDetails = await prisma.organizationTrainingDetail.findMany({
      where: { applicationId: null }, // Or fetch by organization relationship if exists
    });

    const branches = await prisma.organizationBranch.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        address: {
          select: {
            houseNumber: true,
            specialLocation: true,
            kebele: {
              select: {
                nameEnglish: true,
                woreda: {
                  select: {
                    nameEnglish: true,
                    zone: {
                      select: {
                        nameEnglish: true,
                        region: {
                          select: {
                            nameEnglish: true,
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
    });

    // Fetch education stats (guard education level stats)
    const educationStats = await prisma.guardEducationLevelStat.findFirst({
      where: { organizationId: id },
      select: {
        id: true,
        reportingDate: true,
        grade_3_9_male: true,
        grade_3_9_female: true,
        grade_10_12_male: true,
        grade_10_12_female: true,
        certificate_male: true,
        certificate_female: true,
        diploma_male: true,
        diploma_female: true,
        degree_male: true,
        degree_female: true,
        second_degree_male: true,
        second_degree_female: true,
      },
    });

    // Fetch organization documents (DMS)
    const dmsDocuments = await prisma.organizationDocument.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        documentType: true,
        fileUrl: true,
        isVerified: true,
        verifiedAt: true,
        expiryDate: true,
      },
    });

    // Build response payload
    const payload = {
      id: org.id,
      nameEnglish: org.nameEnglish,
      nameAmharic: org.nameAmharic,
      email: org.email,
      phone: org.phone,
      tinNumber: org.tinNumber,
      capitalAmount: org.capitalAmount,
      status: org.status,
      createdAt: org.createdAt,
      numberOfOffices: org.numberOfOffices ?? org._count?.branches ?? 0,
      numberOfVehicles: org.numberOfVehicles ?? 0,
      numberOfComputers: org.numberOfComputers ?? 0,
      hasStoreHouse: org.hasStoreHouse,
      employees: employees.map((e) => ({
        id: e.id,
        userId: e.userId,
        organizationId: e.organizationId,
        positionId: e.positionId ?? null,
        addressId: e.addressId ?? null,
        fullName: e.user?.fullName ?? "",
        email: e.user?.email ?? "",
        positionName: e.position?.name ?? "",
        gender: e.gender ?? "",
        citizenship: e.citizenship ?? "",
        age: e.age ?? 0,
        educationLevel: e.educationLevel ?? "",
        workExpYears: e.workExpYears ?? 0,
        isBlacklisted: e.isBlacklisted,
        employmentStatus: e.employmentStatus ?? "",
        employmentStartDate: e.employmentStartDate
          ? new Date(e.employmentStartDate).toISOString().split("T")[0]
          : "",
        address: e.address
          ? {
              id: e.addressId ?? 0,
              houseNumber: e.address.houseNumber ?? "",
              specialLocation: e.address.specialLocation ?? "",
              kebeleName: e.address.kebele?.nameEnglish ?? "",
              woredaName: e.address.kebele?.woreda?.nameEnglish ?? "",
              zoneName: e.address.kebele?.woreda?.zone?.nameEnglish ?? "",
              regionName:
                e.address.kebele?.woreda?.zone?.region?.nameEnglish ?? "",
            }
          : null,
      })),
      incidents: incidents.map((inc) => ({
        id: inc.id,
        crimeCategory: inc.crimeCategory,
        incidentDate: inc.incidentDate.toISOString(),
        locationOfIncident: inc.locationOfIncident,
        incidentDescription: inc.incidentDescription,
        reportedAt: inc.reportedAt.toISOString(),
        isReportedWithin24h: inc.isReportedWithin24h,
        localPoliceStation: inc.localPoliceStation ?? "",
        localPoliceRefNumber: inc.localPoliceRefNumber ?? "",
        federalPoliceStatus: inc.federalPoliceStatus ?? "Pending Review",
        penalties: inc.penalties.map((p) => ({
          id: p.id,
          penaltyType: p.penaltyType ?? "",
          amount: p.amount?.toString() ?? "0",
          description: p.description ?? "",
          issuedDate: p.issuedDate.toISOString().split("T")[0],
        })),
      })),
      educationStats: educationStats
        ? {
            id: educationStats.id,
            reportingDate: educationStats.reportingDate
              ? new Date(educationStats.reportingDate)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            grade_3_9_male: educationStats.grade_3_9_male,
            grade_3_9_female: educationStats.grade_3_9_female,
            grade_10_12_male: educationStats.grade_10_12_male,
            grade_10_12_female: educationStats.grade_10_12_female,
            certificate_male: educationStats.certificate_male,
            certificate_female: educationStats.certificate_female,
            diploma_male: educationStats.diploma_male,
            diploma_female: educationStats.diploma_female,
            degree_male: educationStats.degree_male,
            degree_female: educationStats.degree_female,
            second_degree_male: educationStats.second_degree_male,
            second_degree_female: educationStats.second_degree_female,
          }
        : null,
      trainingDetails: trainingDetails.map((t) => ({
        id: t.id,
        trainingBodyName: t.trainingBodyName ?? "",
        trainingAddress: t.trainingAddress ?? "",
        trainingStartDate: t.trainingStartDate
          ? new Date(t.trainingStartDate).toISOString().split("T")[0]
          : "",
        trainingEndDate: t.trainingEndDate
          ? new Date(t.trainingEndDate).toISOString().split("T")[0]
          : "",
        trainingDurationDays: t.trainingDurationDays ?? 0,
        totalTraineesMale: t.totalTraineesMale,
        totalTraineesFemale: t.totalTraineesFemale,
        totalNotTraineesMale: t.totalNotTraineesMale,
        totalNotTraineesFemale: t.totalNotTraineesFemale,
      })),
      serviceContracts: serviceContracts.map((sc) => ({
        id: sc.id,
        serviceUserName: sc.serviceUserName,
        contractUrl: sc.contractUrl,
        assignedPersonnelCount: sc.assignedPersonnelCount,
        status: sc.status ?? "Unknown",
        addressText: formatNestedAddress(sc.address),
        createdAt: sc.createdAt.toISOString().split("T")[0],
        updatedAt: sc.updatedAt.toISOString().split("T")[0],
      })),
      branches: branches.map((branch) => ({
        id: branch.id,
        addressText: formatNestedAddress(branch.address),
      })),
      dmsDocuments: dmsDocuments.map((doc) => ({
        id: doc.id.toString(),
        documentName: doc.documentType,
        type: doc.isVerified ? "Basic" : "Yearly Renewed",
        referenceNumber: doc.id.toString(),
        issuedDate: new Date().toISOString().split("T")[0],
        expiryDate: doc.expiryDate
          ? new Date(doc.expiryDate).toISOString().split("T")[0]
          : undefined,
        status: doc.expiryDate
          ? new Date(doc.expiryDate) < new Date()
            ? "Expired"
            : new Date(doc.expiryDate).getTime() - Date.now() <
                30 * 24 * 60 * 60 * 1000
              ? "Expiring Soon"
              : "Active"
          : "Permanent",
        fileUrl: doc.fileUrl,
      })),
    };

    return ApiResponse.success(res, "Organization details retrieved", payload);
  } catch (error: any) {
    console.error("Get Organization Details Error:", error?.message ?? error);
    return ApiResponse.error(
      res,
      "Failed to fetch organization details",
      500,
      error?.message ?? String(error),
    );
  }
};

/**
 * Update organization status and/or registered date (createdAt)
 */
export const updateOrganizationHandler = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return ApiResponse.error(res, "Invalid organization id", 400);
  }

  const { status, createdAt } = req.body as {
    status?: string;
    createdAt?: string;
  };

  const data: any = {};
  if (typeof status === "string") data.status = status;
  if (createdAt) {
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) {
      return ApiResponse.error(res, "Invalid createdAt datetime", 400);
    }
    data.createdAt = d;
  }

  if (Object.keys(data).length === 0) {
    return ApiResponse.error(res, "No updatable fields provided", 400);
  }

  try {
    const updated = await prisma.organization.update({
      where: { id },
      data,
      select: {
        id: true,
        nameEnglish: true,
        status: true,
        createdAt: true,
      },
    });

    return ApiResponse.success(res, "Organization updated", updated);
  } catch (err: any) {
    console.error("Update Organization Error:", err?.message ?? err);
    return ApiResponse.error(
      res,
      "Failed to update organization",
      500,
      err?.message ?? String(err),
    );
  }
};
