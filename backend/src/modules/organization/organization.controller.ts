import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";
import {
  deleteDocumentFile,
  getDocumentUrl,
} from "../../utils/documentOrganizer";
import {
  buildPrefixedFilename,
  fileFilter,
  resolveOrganizationFolderName,
} from "../../middleware/fileUpload";
import { NotificationService } from "../notification/notification.service";

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
        tradeName: true,
        email: true,
        phone: true,
        capitalAmount: true,
        status: true,
        createdAt: true,
        address: {
          select: {
            id: true,
            kebele: {
              select: {
                id: true,
                woreda: {
                  select: {
                    id: true,
                    zone: {
                      select: {
                        id: true,
                        regionId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
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
      tradeName: o.tradeName,
      email: o.email,
      phone: o.phone,
      capitalAmount: o.capitalAmount,
      status: o.status,
      createdAt: o.createdAt,
      address: o.address,
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

    // Fetch organization with basic fields (include head office address)
    const org = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        nameEnglish: true,
        nameAmharic: true,
        tradeName: true,
        email: true,
        phone: true,
        faxNumber: true,
        capitalAmount: true,
        status: true,
        createdAt: true,
        tinNumber: true,
        numberOfOffices: true,
        numberOfVehicles: true,
        numberOfComputers: true,
        hasStoreHouse: true,
        address: {
          select: {
            houseNumber: true,
            specialLocation: true,
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
            phone: true,
            faydaId: true,
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
        gender: true,
        citizenship: true,
        age: true,
        educationLevel: true,
        workExpYears: true,
        TotalExpYears: true,
        isBlacklisted: true,
        employmentStatus: true,
        employmentStartDate: true,
        documents: {
          select: {
            id: true,
            documentType: true,
            fileUrl: true,
            isVerified: true,
            verifiedAt: true,
            uploadedAt: true,
          },
        },
      },
    });

    // Fetch organization incident reports
    const incidents = await prisma.incidentReport.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        organizationId: true,
        fileNumber: true,
        reportDate: true,
        serviceReceiverName: true,
        crimeType: true,
        crimeInCapitalAmount: true,
        incidentStartTimestamp: true,
        crimeCount: true,
        damageDescription: true,
        securityPersonnelCount: true,
        customerPersonnelCount: true,
        otherPartiesCount: true,
        SecurityCustomerOtherBodyCount: true,
        suspectedBodiesCount: true,
        actionTakenStatus: true,
        explanation: true,
        reporterName: true,
        reporterTitle: true,
        reporterJobResp: true,
        reporterSignatureUrl: true,
        efpOfficerName: true,
        efpOfficerTitle: true,
        efpOfficerJobResp: true,
        efpOfficerSignatureUrl: true,
        efpSignDate: true,
        superiorName: true,
        superiorTitle: true,
        superiorJobResp: true,
        superiorFeedback: true,
        superiorSignatureUrl: true,
        superiorSignDate: true,
        suspects: {
          select: {
            id: true,
            suspectName: true,
            relationToAgency: true,
            employeeId: true,
          },
        },
        organization: {
          select: {
            id: true,
            nameEnglish: true,
            nameAmharic: true,
          },
        },
        createdAt: true,
        updatedAt: true,
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
        terminatedAt: true,
        updatedAt: true,
        address: {
          select: {
            houseNumber: true,
            specialLocation: true,
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
      },
    });

    // Fetch training details for this organization through its applications
    const trainingDetails = await prisma.organizationTrainingDetail.findMany({
      where: {
        application: {
          organizationId: id,
        },
      },
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
        issuedDate: true,
        expiryDate: true,
      },
    });

    // Build response payload
    const payload = {
      id: org.id,
      nameEnglish: org.nameEnglish,
      nameAmharic: org.nameAmharic,
      tradeName: org.tradeName,
      email: org.email,
      phone: org.phone,
      fax: org.faxNumber ?? "",
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
        phone: e.user?.phone ?? "",
        positionName: e.position?.name ?? "",
        gender: e.gender ?? "",
        citizenship: e.citizenship ?? "",
        age: e.age ?? 0,
        educationLevel: e.educationLevel ?? "",
        workExpYears: e.workExpYears ?? 0,
        totalExpYears: e.TotalExpYears ?? 0,
        isBlacklisted: e.isBlacklisted,
        employmentStatus: e.employmentStatus ?? "",
        employmentStartDate: e.employmentStartDate
          ? new Date(e.employmentStartDate).toISOString().split("T")[0]
          : "",
        faydaId: e.user?.faydaId ?? "",
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
        documents: e.documents.map((doc) => ({
          id: doc.id,
          documentType: doc.documentType,
          fileUrl: doc.fileUrl,
          isVerified: doc.isVerified,
          verifiedAt: doc.verifiedAt
            ? new Date(doc.verifiedAt).toISOString().split("T")[0]
            : null,
          uploadedAt: doc.uploadedAt
            ? new Date(doc.uploadedAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        })),
      })),
      incidents: incidents.map((inc) => ({
        id: inc.id,
        organizationId: inc.organizationId,
        fileNumber: inc.fileNumber,
        reportDate: inc.reportDate.toISOString(),
        serviceReceiverName: inc.serviceReceiverName,
        crimeType: inc.crimeType,
        crimeInCapitalAmount: inc.crimeInCapitalAmount?.toNumber?.() ?? null,
        incidentStartTimestamp: inc.incidentStartTimestamp.toISOString(),
        crimeCount: inc.crimeCount,
        damageDescription: inc.damageDescription,
        securityPersonnelCount: inc.securityPersonnelCount,
        customerPersonnelCount: inc.customerPersonnelCount,
        otherPartiesCount: inc.otherPartiesCount,
        SecurityCustomerOtherBodyCount: inc.SecurityCustomerOtherBodyCount,
        suspectedBodiesCount: inc.suspectedBodiesCount,
        actionStatus: inc.actionTakenStatus,
        actionTakenStatus: inc.actionTakenStatus,
        explanation: inc.explanation,
        reporterName: inc.reporterName,
        reporterTitle: inc.reporterTitle,
        reporterJobResp: inc.reporterJobResp,
        reporterSignatureUrl: inc.reporterSignatureUrl,
        efpOfficerName: inc.efpOfficerName,
        efpOfficerTitle: inc.efpOfficerTitle,
        efpOfficerJobResp: inc.efpOfficerJobResp,
        efpOfficerSignatureUrl: inc.efpOfficerSignatureUrl,
        efpSignDate: inc.efpSignDate?.toISOString?.() ?? null,
        superiorName: inc.superiorName,
        superiorTitle: inc.superiorTitle,
        superiorJobResp: inc.superiorJobResp,
        superiorFeedback: inc.superiorFeedback,
        superiorSignatureUrl: inc.superiorSignatureUrl,
        superiorSignDate: inc.superiorSignDate?.toISOString?.() ?? null,
        suspects: inc.suspects.map((suspect) => ({
          id: suspect.id,
          suspectName: suspect.suspectName,
          relationToAgency: suspect.relationToAgency,
          employeeId: suspect.employeeId,
        })),
        organization: inc.organization,
        createdAt: inc.createdAt.toISOString(),
        updatedAt: inc.updatedAt.toISOString(),
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
        region:
          sc.address?.kebele?.woreda?.zone?.region?.nameEnglish ||
          sc.address?.kebele?.woreda?.zone?.region?.nameAmharic ||
          "",
        zone:
          sc.address?.kebele?.woreda?.zone?.nameEnglish ||
          sc.address?.kebele?.woreda?.zone?.nameAmharic ||
          "",
        woreda:
          sc.address?.kebele?.woreda?.nameEnglish ||
          sc.address?.kebele?.woreda?.nameAmharic ||
          "",
        kebele:
          sc.address?.kebele?.nameEnglish ||
          sc.address?.kebele?.nameAmharic ||
          "",
        houseNumber: sc.address?.houseNumber ?? "",
        specialLocation: sc.address?.specialLocation ?? "",
        createdAt: sc.createdAt.toISOString().split("T")[0],
        updatedAt: sc.updatedAt.toISOString().split("T")[0],
        terminatedAt: sc.terminatedAt
          ? sc.terminatedAt.toISOString().split("T")[0]
          : "",
      })),
      branches: branches.map((branch) => ({
        id: branch.id,
        addressText: formatNestedAddress(branch.address),
      })),
      headOfficeAddress: formatNestedAddress(org.address),
      dmsDocuments: dmsDocuments.map((doc) => ({
        id: doc.id.toString(),
        documentName: doc.documentType,
        isVerified: doc.isVerified,
        // Classify by file path: if URL contains /<year>_renewal/ (e.g., /2026_renewal/),
        // it's a Yearly Renewed document; otherwise it's a Basic/Statutory credential.
        type: /\/\d{4}_renewal\//.test(doc.fileUrl)
          ? "Yearly Renewed"
          : "Basic",
        referenceNumber: doc.id.toString(),
        // Use verifiedAt as the best-available timestamp for issued/checked date;
        // if not present, fall back to today's date. Adding a proper `createdAt`
        // column to `OrganizationDocument` is recommended for accurate history.
        issuedDate: doc.issuedDate
          ? new Date(doc.issuedDate).toISOString().split("T")[0]
          : doc.verifiedAt
            ? new Date(doc.verifiedAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
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
const resolveServiceContractUploadDir = (organizationName: string) => {
  const orgFolder = resolveOrganizationFolderName(organizationName);
  return path.join(
    process.cwd(),
    "uploads",
    "organization",
    orgFolder,
    "service_contracts",
  );
};

const buildServiceContractStorage = (organizationName: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = resolveServiceContractUploadDir(organizationName);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename("service_contract", file.originalname));
    },
  });

const resolveKebeleId = async (payload: Record<string, unknown>) => {
  const maybeId = Number(
    payload.kebeleId ?? payload.kebele_id ?? payload.kebele ?? 0,
  );
  if (Number.isFinite(maybeId) && maybeId > 0) {
    return maybeId;
  }

  const kebeleName = String(
    payload.kebeleName ?? payload.kebele_name ?? payload.kebele ?? "",
  ).trim();
  if (!kebeleName) {
    return null;
  }

  const whereClause: any = {
    OR: [{ nameEnglish: kebeleName }, { nameAmharic: kebeleName }],
  };

  const woredaId = Number(
    payload.woredaId ?? payload.woreda_id ?? payload.woreda ?? 0,
  );
  const woredaName = String(
    payload.woredaName ?? payload.woreda_name ?? "",
  ).trim();
  if (Number.isFinite(woredaId) && woredaId > 0) {
    whereClause.woreda = { id: woredaId };
  } else if (woredaName) {
    whereClause.woreda = {
      OR: [{ nameEnglish: woredaName }, { nameAmharic: woredaName }],
    };
  }

  const kebele = await prisma.kebele.findFirst({
    where: whereClause,
    select: { id: true },
  });

  return kebele?.id ?? null;
};

export const updateOrganizationServiceContractHandler = async (
  req: Request,
  res: Response,
) => {
  const organizationId = Number(req.params.id);
  const contractId = Number(req.params.contractId);

  if (!Number.isFinite(organizationId) || organizationId <= 0) {
    return ApiResponse.error(res, "Invalid organization id", 400);
  }

  if (!Number.isFinite(contractId) || contractId <= 0) {
    return ApiResponse.error(res, "Invalid service contract id", 400);
  }

  const existingContract = await prisma.serviceContract.findFirst({
    where: { id: contractId, organizationId },
    select: {
      id: true,
      addressId: true,
      serviceUserName: true,
      contractUrl: true,
      assignedPersonnelCount: true,
      status: true,
      createdAt: true,
      terminatedAt: true,
    },
  });

  if (!existingContract) {
    return ApiResponse.error(res, "Service contract not found", 404);
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      nameEnglish: true,
      nameAmharic: true,
    },
  });

  if (!organization) {
    return ApiResponse.error(res, "Organization not found", 404);
  }

  const upload = multer({
    storage: buildServiceContractStorage(
      organization.nameEnglish || organization.nameAmharic || "organization",
    ),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single("contractDoc");

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      console.error("Service contract update upload failed:", uploadError);
      return ApiResponse.error(
        res,
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload contract document.",
        400,
        uploadError instanceof Error
          ? uploadError.message
          : String(uploadError),
      );
    }

    const file = req.file;
    const {
      serviceUserName,
      status,
      contractStartDate,
      terminatedAt,
      assignedPersonnelCount,
      houseNumber,
      specialLocation,
    } = req.body as Record<string, string>;

    const errors: string[] = [];
    const nextServiceUserName = serviceUserName?.trim() || "";
    if (serviceUserName !== undefined && !nextServiceUserName) {
      errors.push("Client name is required.");
    }

    const assignedPersonnel = Number(
      assignedPersonnelCount ?? existingContract.assignedPersonnelCount,
    );
    if (!Number.isFinite(assignedPersonnel) || assignedPersonnel <= 0) {
      errors.push("Assigned guards must be greater than 0.");
    }

    const contractStart = contractStartDate
      ? new Date(contractStartDate)
      : existingContract.createdAt;
    if (
      contractStartDate &&
      (!contractStart || Number.isNaN(contractStart.getTime()))
    ) {
      errors.push("Contract start date must be valid.");
    }

    const contractTermination = terminatedAt
      ? new Date(terminatedAt)
      : (existingContract.terminatedAt ?? null);
    if (
      terminatedAt &&
      (!contractTermination || Number.isNaN(contractTermination.getTime()))
    ) {
      errors.push("Contract termination date must be valid when provided.");
    }

    if (errors.length > 0) {
      return ApiResponse.error(res, errors.join(" "), 400, { errors });
    }

    try {
      const updateData: Record<string, unknown> = {};

      if (nextServiceUserName) {
        updateData.serviceUserName = nextServiceUserName;
      }
      if (typeof assignedPersonnelCount !== "undefined") {
        updateData.assignedPersonnelCount = assignedPersonnel;
      }
      if (contractStartDate) {
        updateData.createdAt = contractStart;
      }
      if (typeof terminatedAt !== "undefined") {
        updateData.terminatedAt = contractTermination ?? null;
      }

      const normalizedStatus =
        typeof status === "string" && status.trim()
          ? status.trim()
          : existingContract.status || "Active";
      const now = new Date();
      updateData.status =
        contractTermination && contractTermination < now
          ? "Expired"
          : normalizedStatus;

      if (file) {
        const relativePath = path
          .relative(process.cwd(), file.path)
          .replace(/\\/g, "/");
        updateData.contractUrl = getDocumentUrl(relativePath);
      }

      const addressUpdateData: Record<string, unknown> = {};
      if (typeof houseNumber === "string" && houseNumber.trim()) {
        addressUpdateData.houseNumber = houseNumber.trim();
      }
      if (typeof specialLocation === "string") {
        addressUpdateData.specialLocation = specialLocation.trim() || undefined;
      }
      const kebeleId = await resolveKebeleId(req.body);
      if (kebeleId) {
        addressUpdateData.kebeleId = kebeleId;
      }

      if (Object.keys(addressUpdateData).length > 0) {
        await prisma.address.update({
          where: { id: existingContract.addressId },
          data: addressUpdateData,
        });
      }

      const updatedContract = await prisma.serviceContract.update({
        where: { id: contractId },
        data: updateData,
        select: {
          id: true,
          serviceUserName: true,
          contractUrl: true,
          assignedPersonnelCount: true,
          status: true,
          createdAt: true,
          terminatedAt: true,
          updatedAt: true,
          address: {
            select: {
              houseNumber: true,
              specialLocation: true,
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
        },
      });

      const addressParts = [
        updatedContract.address.specialLocation,
        updatedContract.address.houseNumber
          ? `House ${updatedContract.address.houseNumber}`
          : undefined,
        updatedContract.address.kebele?.nameEnglish ||
          updatedContract.address.kebele?.nameAmharic,
        updatedContract.address.kebele?.woreda?.nameEnglish ||
          updatedContract.address.kebele?.woreda?.nameAmharic,
        updatedContract.address.kebele?.woreda?.zone?.nameEnglish ||
          updatedContract.address.kebele?.woreda?.zone?.nameAmharic,
        updatedContract.address.kebele?.woreda?.zone?.region?.nameEnglish ||
          updatedContract.address.kebele?.woreda?.zone?.region?.nameAmharic,
      ]
        .filter(Boolean)
        .join(", ");

      return ApiResponse.success(
        res,
        "Service contract updated successfully.",
        {
          id: updatedContract.id,
          serviceUserName: updatedContract.serviceUserName,
          contractUrl: updatedContract.contractUrl,
          assignedPersonnelCount: updatedContract.assignedPersonnelCount,
          status: updatedContract.status,
          createdAt: updatedContract.createdAt.toISOString().split("T")[0],
          updatedAt: updatedContract.updatedAt.toISOString().split("T")[0],
          terminatedAt: updatedContract.terminatedAt
            ? updatedContract.terminatedAt.toISOString().split("T")[0]
            : "",
          addressText: addressParts,
        },
      );
    } catch (error: any) {
      console.error("Update Service Contract Error:", error?.message ?? error);
      return ApiResponse.error(
        res,
        "Failed to update service contract",
        500,
        error?.message ?? String(error),
      );
    }
  });
};

export const createOrganizationServiceContractHandler = async (
  req: Request,
  res: Response,
) => {
  const organizationId = Number(req.params.id);
  if (!Number.isFinite(organizationId) || organizationId <= 0) {
    return ApiResponse.error(res, "Invalid organization id", 400);
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      nameEnglish: true,
      nameAmharic: true,
    },
  });

  if (!organization) {
    return ApiResponse.error(res, "Organization not found", 404);
  }

  const upload = multer({
    storage: buildServiceContractStorage(
      organization.nameEnglish || organization.nameAmharic || "organization",
    ),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single("contractDoc");

  upload(req, res, async (uploadError) => {
    if (uploadError) {
      console.error("Service contract upload failed:", uploadError);
      return ApiResponse.error(
        res,
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload contract document.",
        400,
        uploadError instanceof Error
          ? uploadError.message
          : String(uploadError),
      );
    }

    const file = req.file;
    if (!file) {
      return ApiResponse.error(res, "Contract document is required", 400);
    }

    const {
      serviceUserName,
      status,
      contractStartDate,
      terminatedAt,
      assignedPersonnelCount,
      houseNumber,
      specialLocation,
    } = req.body as Record<string, string>;

    const errors: string[] = [];
    if (!serviceUserName || !serviceUserName.trim()) {
      errors.push("Client name is required.");
    }
    if (!houseNumber || !houseNumber.trim()) {
      errors.push("House number is required.");
    }

    const assignedPersonnel = Number(assignedPersonnelCount ?? 0);
    if (!Number.isFinite(assignedPersonnel) || assignedPersonnel <= 0) {
      errors.push("Assigned guards must be greater than 0.");
    }

    const contractStart = contractStartDate
      ? new Date(contractStartDate)
      : null;
    if (
      !contractStartDate ||
      !contractStart ||
      Number.isNaN(contractStart.getTime())
    ) {
      errors.push("Contract start date is required and must be valid.");
    }

    const contractTermination = terminatedAt ? new Date(terminatedAt) : null;
    if (
      terminatedAt &&
      (!contractTermination || Number.isNaN(contractTermination.getTime()))
    ) {
      errors.push("Contract termination date must be valid when provided.");
    }

    const kebeleId = await resolveKebeleId(req.body);
    if (!kebeleId) {
      errors.push(
        "A valid kebele selection is required for the contract address.",
      );
    }

    if (errors.length > 0) {
      return ApiResponse.error(res, errors.join(" "), 400, { errors });
    }

    try {
      const resolvedKebeleId = kebeleId as number;
      const address = await prisma.address.create({
        data: {
          kebeleId: resolvedKebeleId,
          houseNumber: houseNumber.trim() || undefined,
          specialLocation: specialLocation?.trim() || undefined,
        },
      });

      const relativePath = path
        .relative(process.cwd(), file.path)
        .replace(/\\/g, "/");
      const contractUrl = getDocumentUrl(relativePath);

      // Determine status: if terminatedAt is provided and in the past, mark Expired
      const now = new Date();
      const incomingStatus = status?.trim() || "Active";
      const finalStatus =
        contractTermination && contractTermination < now
          ? "Expired"
          : incomingStatus;

      const serviceContract = await prisma.serviceContract.create({
        data: {
          organizationId,
          serviceUserName: serviceUserName.trim(),
          contractUrl,
          addressId: address.id,
          assignedPersonnelCount: assignedPersonnel,
          status: finalStatus,
          createdAt: contractStart ?? undefined,
          terminatedAt: contractTermination ?? undefined,
        },
        select: {
          id: true,
          serviceUserName: true,
          contractUrl: true,
          assignedPersonnelCount: true,
          status: true,
          createdAt: true,
          terminatedAt: true,
          updatedAt: true,
          address: {
            select: {
              houseNumber: true,
              specialLocation: true,
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
        },
      });

      const addressParts = [
        serviceContract.address.specialLocation,
        serviceContract.address.houseNumber
          ? `House ${serviceContract.address.houseNumber}`
          : undefined,
        serviceContract.address.kebele?.nameEnglish ||
          serviceContract.address.kebele?.nameAmharic,
        serviceContract.address.kebele?.woreda?.nameEnglish ||
          serviceContract.address.kebele?.woreda?.nameAmharic,
        serviceContract.address.kebele?.woreda?.zone?.nameEnglish ||
          serviceContract.address.kebele?.woreda?.zone?.nameAmharic,
        serviceContract.address.kebele?.woreda?.zone?.region?.nameEnglish ||
          serviceContract.address.kebele?.woreda?.zone?.region?.nameAmharic,
      ]
        .filter(Boolean)
        .join(", ");

      return ApiResponse.success(
        res,
        "Service contract created successfully.",
        {
          id: serviceContract.id,
          serviceUserName: serviceContract.serviceUserName,
          contractUrl: serviceContract.contractUrl,
          assignedPersonnelCount: serviceContract.assignedPersonnelCount,
          status: serviceContract.status,
          createdAt: serviceContract.createdAt.toISOString().split("T")[0],
          updatedAt: serviceContract.updatedAt.toISOString().split("T")[0],
          terminatedAt: serviceContract.terminatedAt
            ? serviceContract.terminatedAt.toISOString().split("T")[0]
            : "",
          addressText: addressParts,
        },
      );
    } catch (error: any) {
      console.error("Create Service Contract Error:", error?.message ?? error);
      return ApiResponse.error(
        res,
        "Failed to create service contract",
        500,
        error?.message ?? String(error),
      );
    }
  });
};

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

/**
 * Create a new organization address change request.
 * POST /api/organizations/address-change-requests
 */
export const createAddressChangeRequestHandler = async (
  req: Request,
  res: Response,
) => {
  const organizationId = Number(req.user?.organizationId ?? 0);
  if (!organizationId || Number.isNaN(organizationId)) {
    return ApiResponse.error(
      res,
      "Organization context is required for address change requests.",
      400,
    );
  }

  const {
    requestedKebeleId,
    requestedHouseNumber,
    requestedSpecialLocation,
    reason,
  } = req.body as {
    requestedKebeleId?: number | string;
    requestedHouseNumber?: string;
    requestedSpecialLocation?: string;
    reason?: string;
  };

  const kebeleId = Number(requestedKebeleId);
  if (!Number.isFinite(kebeleId) || kebeleId <= 0) {
    return ApiResponse.error(
      res,
      "A valid requestedKebeleId is required.",
      400,
    );
  }

  try {
    const organizationExists = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, nameEnglish: true, nameAmharic: true },
    });

    if (!organizationExists) {
      return ApiResponse.error(res, "Organization not found", 404);
    }

    const createdRequest = await prisma.organizationAddressChangeRequest.create(
      {
        data: {
          organizationId,
          requestedKebeleId: kebeleId,
          requestedHouseNumber: requestedHouseNumber?.trim() || undefined,
          requestedSpecialLocation:
            requestedSpecialLocation?.trim() || undefined,
          reason: reason?.trim() || undefined,
          status: "PENDING",
        },
      },
    );

    // Notify Federal Police Admins (role="admin" and status="ACTIVE") about the new address change request
    try {
      console.log("[ADDRESS CHANGE] Querying for admin users...");
      const adminUsers = await prisma.user.findMany({
        where: {
          status: "ACTIVE",
          user_roles: {
            some: {
              roles: {
                role_name: "admin",
              },
            },
          },
        },
        select: { id: true, fullName: true, email: true },
      });

      console.log(
        `[ADDRESS CHANGE] Found ${adminUsers.length} active admin users:`,
        adminUsers.map((u) => ({ id: u.id, name: u.fullName, email: u.email })),
      );

      if (adminUsers.length > 0) {
        const orgName =
          organizationExists?.nameEnglish || "Unknown Organization";
        const orgNameAm =
          organizationExists?.nameAmharic || "Unknown Organization";
        for (const admin of adminUsers) {
          try {
            console.log(
              `[ADDRESS CHANGE] Sending notification to admin ${admin.id} (${admin.fullName})...`,
            );
            await NotificationService.sendBilingualAlert(
              admin.id,
              "ADDRESS_CHANGE_REQUESTED",
              {
                organizationName: orgName,
                organizationNameAm: orgNameAm,
                requestReason: reason?.substring(0, 50) || "No reason provided",
              },
            );
            console.log(
              `[ADDRESS CHANGE] ✓ Notification sent to admin ${admin.id}`,
            );
          } catch (notifyErr) {
            console.warn(
              `[ADDRESS CHANGE] ✗ Failed to notify admin ${admin.id}:`,
              notifyErr instanceof Error ? notifyErr.message : notifyErr,
            );
          }
        }
      } else {
        console.log("[ADDRESS CHANGE] No active admin users found to notify");
      }
    } catch (notifyErr) {
      console.warn(
        "[ADDRESS CHANGE] Error querying/notifying admins:",
        notifyErr instanceof Error ? notifyErr.message : notifyErr,
      );
    }

    return ApiResponse.success(
      res,
      "Address change request submitted successfully.",
      {
        id: createdRequest.addressRequestId,
        status: createdRequest.status,
      },
    );
  } catch (error: any) {
    console.error(
      "Create Address Change Request Error:",
      error?.message ?? error,
    );
    return ApiResponse.error(
      res,
      "Failed to submit address change request",
      500,
      error?.message ?? String(error),
    );
  }
};

/**
 * GET /api/organizations/address-change-requests
 * Returns all address change requests for the authenticated user's organization
 */
export const getAddressChangeRequestsHandler = async (
  req: Request,
  res: Response,
) => {
  const organizationId = Number(req.user?.organizationId ?? 0);
  const roles = Array.isArray(req.user?.roles)
    ? req.user.roles.map((role) => String(role).toLowerCase())
    : [];

  const isAdminView = roles.some((role) =>
    ["admin", "system_admin", "super_admin"].includes(role),
  );

  if (!organizationId && !isAdminView) {
    return ApiResponse.error(
      res,
      "Organization context is required to list address change requests.",
      400,
    );
  }

  try {
    const whereClause = organizationId
      ? { organizationId }
      : isAdminView
        ? {}
        : { organizationId };

    const requests = await prisma.organizationAddressChangeRequest.findMany({
      where: whereClause,
      include: {
        requestedKebele: {
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
        organization: {
          select: {
            nameEnglish: true,
            nameAmharic: true,
            address: {
              select: {
                houseNumber: true,
                specialLocation: true,
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const normalized = requests.map((r) => {
      const kebele = r.requestedKebele as any;
      const requestedWoreda = kebele?.woreda as any;
      const requestedZone = requestedWoreda?.zone as any;
      const requestedRegion = requestedZone?.region as any;
      const currentAddress = (r.organization as any)?.address as any;
      const currentKebele = currentAddress?.kebele as any;
      const currentWoreda = currentKebele?.woreda as any;
      const currentZone = currentWoreda?.zone as any;
      const currentRegion = currentZone?.region as any;

      return {
        id: r.addressRequestId,
        organizationName:
          (r.organization as any)?.nameEnglish ||
          (r.organization as any)?.nameAmharic ||
          "Unknown Organization",
        status: (r.status || "PENDING").toString().toUpperCase(),
        reason: r.reason || "",
        adminFeedback: r.adminFeedback || null,
        createdAt: r.createdAt,
        currentAddress: {
          regionName:
            currentRegion?.nameEnglish || currentRegion?.nameAmharic || "",
          zoneName: currentZone?.nameEnglish || currentZone?.nameAmharic || "",
          woredaName:
            currentWoreda?.nameEnglish || currentWoreda?.nameAmharic || "",
          kebeleName:
            currentKebele?.nameEnglish || currentKebele?.nameAmharic || "",
          specialLocation: currentAddress?.specialLocation ?? null,
          houseNumber: currentAddress?.houseNumber ?? null,
        },
        requestedAddress: {
          regionName:
            requestedRegion?.nameEnglish || requestedRegion?.nameAmharic || "",
          zoneName:
            requestedZone?.nameEnglish || requestedZone?.nameAmharic || "",
          woredaName:
            requestedWoreda?.nameEnglish || requestedWoreda?.nameAmharic || "",
          kebeleName: kebele?.nameEnglish || kebele?.nameAmharic || "",
          specialLocation: r.requestedSpecialLocation ?? null,
          houseNumber: r.requestedHouseNumber ?? null,
        },
      };
    });

    return ApiResponse.success(
      res,
      "Address change requests retrieved",
      normalized,
    );
  } catch (error: any) {
    console.error(
      "Get Address Change Requests Error:",
      error?.message ?? error,
    );
    return ApiResponse.error(
      res,
      "Failed to fetch address change requests",
      500,
      error?.message ?? String(error),
    );
  }
};

/**
 * Delete an organization document
 * DELETE /api/organizations/documents/:docId
 */
export const deleteOrganizationDocumentHandler = async (
  req: Request,
  res: Response,
) => {
  const docId = Number(req.params.docId);

  if (!Number.isFinite(docId) || docId <= 0) {
    return ApiResponse.error(res, "Invalid document id.", 400);
  }

  try {
    // Fetch document to get file path
    const doc = await prisma.organizationDocument.findUnique({
      where: { id: docId },
    });

    if (!doc) {
      return ApiResponse.error(res, "Document not found", 404);
    }

    // Delete file from disk
    try {
      deleteDocumentFile(doc.fileUrl);
    } catch (fileError) {
      console.warn(
        "[WARN] Failed to delete document file:",
        doc.fileUrl,
        fileError,
      );
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const deleted = await prisma.organizationDocument.delete({
      where: { id: docId },
    });

    return ApiResponse.success(res, "Document deleted successfully.", deleted);
  } catch (error: any) {
    console.error(
      "[ERROR] Delete organization document failed:",
      error?.message || error,
    );
    return ApiResponse.error(
      res,
      error?.message || "Failed to delete document.",
      500,
      error?.message,
    );
  }
};

const createDocumentReplacementStorage = (
  existingRelativePath: string,
  prefix: string,
) => {
  const sanitizedRelativePath = existingRelativePath.replace(/^[/\\]+/, "");
  const destinationDir = path.dirname(
    path.join(process.cwd(), sanitizedRelativePath),
  );

  return multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename(prefix, file.originalname));
    },
  });
};

/**
 * Replace an organization document file with a newly uploaded file.
 * PATCH /api/organizations/documents/:docId
 */
export const replaceOrganizationDocumentHandler = async (
  req: Request,
  res: Response,
) => {
  const docId = Number(req.params.docId);

  if (!Number.isFinite(docId) || docId <= 0) {
    return ApiResponse.error(res, "Invalid document id.", 400);
  }

  try {
    const existingDoc = await prisma.organizationDocument.findUnique({
      where: { id: docId },
    });

    if (!existingDoc) {
      return ApiResponse.error(res, "Document not found", 404);
    }

    const documentTypePrefix = String(
      existingDoc.documentType || "organization_document",
    )
      .replace(/\s+/g, "_")
      .toLowerCase();

    const upload = multer({
      storage: createDocumentReplacementStorage(
        existingDoc.fileUrl,
        documentTypePrefix,
      ),
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }).single("document");

    upload(req, res, async (uploadError) => {
      if (uploadError) {
        console.error(
          "[ERROR] Document replacement upload failed:",
          uploadError,
        );
        return ApiResponse.error(
          res,
          uploadError.message || "Failed to upload replacement document.",
          400,
          uploadError instanceof Error
            ? uploadError.message
            : String(uploadError),
        );
      }

      const file = req.file;
      if (!file) {
        return ApiResponse.error(res, "Document file is required", 400);
      }

      const relativePath = path
        .relative(process.cwd(), file.path)
        .replace(/\\/g, "/");

      try {
        deleteDocumentFile(existingDoc.fileUrl);
      } catch (fileDeleteError) {
        console.warn(
          "[WARN] Failed to delete previous organization document file:",
          existingDoc.fileUrl,
          fileDeleteError,
        );
      }

      const updated = await prisma.organizationDocument.update({
        where: { id: docId },
        data: {
          fileUrl: relativePath,
          isVerified: false,
          verifiedAt: null,
        },
        select: {
          id: true,
          organizationId: true,
          documentType: true,
          fileUrl: true,
          isVerified: true,
          verifiedAt: true,
          issuedDate: true,
          expiryDate: true,
        },
      });

      return ApiResponse.success(res, "Document updated successfully.", {
        document: updated,
      });
    });
  } catch (error: any) {
    console.error("[ERROR] Replace organization document failed:", error);
    return ApiResponse.error(
      res,
      error?.message || "Failed to update document.",
      500,
      error?.message,
    );
  }
};
