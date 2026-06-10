import prisma from "../../lib/prisma";
import fs from "fs/promises";
import path from "path";
import { buildPrefixedFilename } from "../../middleware/fileUpload";
import { RenewalValidationError } from "./renewal.errors";
import { CertificationService } from "../certification/certification.service";

type UploadedRenewalFile = {
  fieldname: string;
  originalname: string;
  buffer: Buffer;
  mimetype: string;
};

const RENEWAL_ROOT_DIR = path.join(process.cwd(), "uploads", "organization");

const sanitizeFolderSegment = (value: string) =>
  value
    .trim()
    .replace(/[\\/?:*"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";

const getDocumentTypeLabel = (fieldname: string) => {
  const labels: Record<string, string> = {
    trade_license: "Renewed Trade License",
    labor_skill: "Labor and Skill Bureau Registration",
    tax_clearance: "Taxpayer Clearance",
    insurance: "Insurance Coverage",
    tech_list: "List of Technologies Used",
    capital: "Capital (Bank Statement)",
    payroll: "Payroll",
    social_security: "Social Security Payment Slip",
    office_lease: "Office Tenancy Agreement",
    car_lease: "Car Ownership or Lease Agreement",
    warranty_form: "Security Guard Warranty Form",
    security_guard_warranty_form: "Security Guard Warranty Form",
    training_cert: "Training Certificate",
  };

  return labels[fieldname] || fieldname.replace(/_/g, " ");
};

const writeRenewalFiles = async (params: {
  organizationName: string;
  renewalYear: number;
  files: UploadedRenewalFile[];
}) => {
  const safeOrgName = sanitizeFolderSegment(params.organizationName);
  const yearFolder = `${params.renewalYear}_renewal`;
  const createdPaths: string[] = [];

  for (const file of params.files) {
    const targetDir = path.join(RENEWAL_ROOT_DIR, safeOrgName, yearFolder);
    await fs.mkdir(targetDir, { recursive: true });

    const filename = buildPrefixedFilename(file.fieldname, file.originalname);
    const absolutePath = path.join(targetDir, filename);
    await fs.writeFile(absolutePath, file.buffer);

    createdPaths.push(
      path.relative(process.cwd(), absolutePath).split(path.sep).join("/"),
    );
  }

  return createdPaths;
};

const cleanupWrittenFiles = async (relativePaths: string[]) => {
  for (const relativePath of relativePaths) {
    try {
      await fs.unlink(path.join(process.cwd(), relativePath));
    } catch {
      // best effort cleanup
    }
  }
};

const parseJsonPayload = (payload: string) => {
  try {
    return JSON.parse(payload || "{}");
  } catch {
    return {};
  }
};

const parseOptionalInt = (value: unknown) => {
  if (value === null || typeof value === "undefined" || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseOptionalDecimal = (value: unknown) => {
  if (value === null || typeof value === "undefined" || value === "") {
    return null;
  }

  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDateOrNull = (value: unknown) => {
  if (value === null || typeof value === "undefined" || value === "")
    return null;
  const d = new Date(String(value));
  return Number.isFinite(d.getTime()) ? d : null;
};

const getTrainingData = (data: unknown) => {
  const obj =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const trainingBodyName =
    String(obj.trainingProvider ?? obj.trainingBodyName ?? "").trim() || null;
  const trainingAddress =
    String(obj.trainingPlace ?? obj.trainingAddress ?? "").trim() || null;
  const trainingStartDate = parseDateOrNull(
    obj.trainingStartDate ?? obj.trainingStart,
  );
  const trainingEndDate = parseDateOrNull(
    obj.trainingEndDate ?? obj.trainingEnd,
  );
  const trainingDurationDays = parseOptionalInt(
    obj.trainingDays ?? obj.trainingDurationDays ?? obj.numberOfDays,
  );

  const totalTraineesMale =
    parseOptionalInt(
      obj.trainedMale ?? obj.trained_male ?? obj.totalTraineesMale,
    ) ?? 0;
  const totalTraineesFemale =
    parseOptionalInt(
      obj.trainedFemale ?? obj.trained_female ?? obj.totalTraineesFemale,
    ) ?? 0;
  const totalNotTraineesMale =
    parseOptionalInt(
      obj.notTrainedMale ?? obj.not_trained_male ?? obj.totalNotTraineesMale,
    ) ?? 0;
  const totalNotTraineesFemale =
    parseOptionalInt(
      obj.notTrainedFemale ??
        obj.not_trained_female ??
        obj.totalNotTraineesFemale,
    ) ?? 0;

  return {
    trainingBodyName,
    trainingAddress,
    trainingStartDate,
    trainingEndDate,
    trainingDurationDays,
    totalTraineesMale,
    totalTraineesFemale,
    totalNotTraineesMale,
    totalNotTraineesFemale,
  };
};

const parseStoreHouse = (value: unknown) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  return ["true", "yes", "1", "y"].includes(normalized);
};

const getOrganizationUpdateData = (payload: unknown) => {
  const data =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const numberOfOffices = parseOptionalInt(
    data.numberOfOffices ?? data.offices,
  );
  const numberOfVehicles = parseOptionalInt(
    data.numberOfVehicles ?? data.vehicles,
  );
  const numberOfComputers = parseOptionalInt(
    data.numberOfComputers ?? data.computers,
  );
  const capitalAmount = parseOptionalDecimal(
    data.capitalAmount ?? data.capital,
  );
  const hasStoreHouse = parseStoreHouse(data.hasStoreHouse ?? data.storeHouse);

  const updateData: Record<string, unknown> = {};

  if (numberOfOffices !== null) updateData.numberOfOffices = numberOfOffices;
  if (numberOfVehicles !== null) updateData.numberOfVehicles = numberOfVehicles;
  if (numberOfComputers !== null)
    updateData.numberOfComputers = numberOfComputers;
  if (capitalAmount !== null) updateData.capitalAmount = capitalAmount;
  if (hasStoreHouse !== null) updateData.hasStoreHouse = hasStoreHouse;

  return updateData;
};

const isActiveStatus = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase() === "active";

const isCertificateValidForRenewal = (cert: {
  status?: string | null;
  expiryDate: Date;
}) => {
  const normalizedStatus = String(cert.status ?? "Active")
    .trim()
    .toLowerCase();

  if (normalizedStatus === "revoked" || normalizedStatus === "suspended") {
    return false;
  }

  // Valid through the expiry calendar day; stale EXPIRED status is corrected via sync.
  return !CertificationService.isPastExpiryDay(cert.expiryDate);
};

/**
 * Renewal opens after 11/12 of the certificate validity window (issue → expiry).
 * For a 12-month cert this is ~11 months after issue; shorter certs scale proportionally
 * so renewal is always possible before expiry (e.g. issue 8/27/2026, expiry 5/30/2027).
 */
const RENEWAL_OPEN_VALIDITY_FRACTION = 11 / 12;

const startOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/** Normalize SQL @db.Date values without timezone day-shift. */
const toCertCalendarDate = (value: Date | string) => {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error("Invalid certificate date.");
  }
  return startOfDay(
    new Date(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    ),
  );
};

const getEarliestRenewalSubmitDate = (issueDate: Date, expiryDate: Date) => {
  const issue = toCertCalendarDate(issueDate);
  const expiry = toCertCalendarDate(expiryDate);

  if (expiry.getTime() <= issue.getTime()) {
    throw new Error("Certificate expiry date must be after the issue date.");
  }

  const validityMs = expiry.getTime() - issue.getTime();
  const renewalOpensAt =
    issue.getTime() + validityMs * RENEWAL_OPEN_VALIDITY_FRACTION;

  return startOfDay(new Date(renewalOpensAt));
};

const hasRenewalForCalendarYear = async (
  organizationId: number,
  renewalYear: number,
) => {
  const renewalRow = await prisma.renewalApplication.findFirst({
    where: { organizationId, renewalYear },
  });
  if (renewalRow) return true;

  const yearStart = new Date(renewalYear, 0, 1);
  const yearEnd = new Date(renewalYear + 1, 0, 1);

  const applicationRow = await prisma.application.findFirst({
    where: {
      organizationId,
      type: "Renewal",
      applicationDate: { gte: yearStart, lt: yearEnd },
    },
  });

  return Boolean(applicationRow);
};

const assertRenewalSubmissionAllowed = async (params: {
  organizationId: number;
  issueDate: Date;
  expiryDate: Date;
  renewalYear: number;
}) => {
  const today = startOfDay(new Date());
  const earliestSubmitDate = getEarliestRenewalSubmitDate(
    params.issueDate,
    params.expiryDate,
  );

  if (today < earliestSubmitDate) {
    throw new RenewalValidationError(
      "RENEWAL_TOO_EARLY",
      `Renewal can only be submitted during the final month of your certificate validity period. Earliest date: ${earliestSubmitDate.toISOString().slice(0, 10)}.`,
    );
  }

  const alreadySubmitted = await hasRenewalForCalendarYear(
    params.organizationId,
    params.renewalYear,
  );

  if (alreadySubmitted) {
    throw new RenewalValidationError(
      "RENEWAL_ALREADY_SUBMITTED",
      `You have already submitted a renewal application for ${params.renewalYear}. Only one renewal application is allowed per calendar year.`,
      409,
    );
  }
};

const resolveOrganizationIdsForUser = async (userId: number) => {
  const organizationIds = new Set<number>();

  const applications = await prisma.application.findMany({
    where: { userId },
    select: { organizationId: true },
    distinct: ["organizationId"],
  });

  for (const application of applications) {
    if (application.organizationId) {
      organizationIds.add(application.organizationId);
    }
  }

  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { organizationId: true },
  });

  if (employee?.organizationId) {
    organizationIds.add(employee.organizationId);
  }

  return Array.from(organizationIds);
};

export class RenewalService {
  static async validateEligibility(
    certificateSerialNumber: string,
    userId: number,
  ) {
    if (!Number.isFinite(userId)) {
      throw new RenewalValidationError(
        "AUTHENTICATION_REQUIRED",
        "Authentication is required to verify renewal eligibility.",
        401,
      );
    }

    const normalizedSerial = certificateSerialNumber.trim();

    if (!normalizedSerial) {
      throw new RenewalValidationError(
        "CERTIFICATE_NOT_FOUND",
        "Please enter a valid certificate serial number.",
      );
    }

    const certification = await prisma.certification.findUnique({
      where: { certificateSerialNumber: normalizedSerial },
      include: {
        organization: {
          select: {
            id: true,
            nameAmharic: true,
            nameEnglish: true,
            status: true,
          },
        },
      },
    });

    if (!certification) {
      throw new RenewalValidationError(
        "CERTIFICATE_NOT_FOUND",
        "No certificate was found with this serial number. Check the number printed on your license document and try again.",
        404,
      );
    }

    const syncedCertification =
      await CertificationService.syncExpiryStatus(certification);

    if (!syncedCertification.organization) {
      throw new RenewalValidationError(
        "CERTIFICATE_NOT_LINKED",
        "This certificate is not linked to an organization. Contact EFP-PSO support for assistance.",
      );
    }

    const userOrganizationIds = await resolveOrganizationIdsForUser(userId);

    if (userOrganizationIds.length === 0) {
      throw new RenewalValidationError(
        "NO_ORGANIZATION",
        "Your account is not linked to a licensed organization. Complete your license application before submitting a renewal.",
        403,
      );
    }

    if (!userOrganizationIds.includes(syncedCertification.organization.id)) {
      throw new RenewalValidationError(
        "CERTIFICATE_NOT_OWNED",
        "This certificate serial number does not belong to your organization. Enter the serial number from your own active license.",
        403,
      );
    }

    if (!isActiveStatus(syncedCertification.organization.status)) {
      throw new RenewalValidationError(
        "ORGANIZATION_INACTIVE",
        "Your organization is not active. Contact EFP-PSO support before submitting a renewal.",
      );
    }

    if (!isCertificateValidForRenewal(syncedCertification)) {
      throw new RenewalValidationError(
        "CERTIFICATE_INACTIVE",
        "Your certificate is expired or inactive. Contact EFP-PSO support for assistance.",
      );
    }

    const renewalYear = new Date().getFullYear();
    await assertRenewalSubmissionAllowed({
      organizationId: syncedCertification.organization.id,
      issueDate: syncedCertification.issueDate,
      expiryDate: syncedCertification.expiryDate,
      renewalYear,
    });

    const earliestSubmitDate = getEarliestRenewalSubmitDate(
      syncedCertification.issueDate,
      syncedCertification.expiryDate,
    );

    return {
      organizationId: syncedCertification.organization.id,
      certificateId: syncedCertification.id,
      certificateSerialNumber: syncedCertification.certificateSerialNumber,
      organization: {
        id: syncedCertification.organization.id,
        nameAmharic: syncedCertification.organization.nameAmharic,
        nameEnglish: syncedCertification.organization.nameEnglish,
        status: syncedCertification.organization.status,
      },
      certification: {
        id: syncedCertification.id,
        status: syncedCertification.status,
        level: syncedCertification.level,
        issueDate: syncedCertification.issueDate,
        expiryDate: syncedCertification.expiryDate,
      },
      renewalPolicy: {
        renewalYear,
        issueDate: syncedCertification.issueDate,
        expiryDate: syncedCertification.expiryDate,
        earliestSubmitDate,
        validityFractionBeforeRenewal: RENEWAL_OPEN_VALIDITY_FRACTION,
        canSubmit: true,
      },
    };
  }

  static async submitRenewal(input: {
    certificateSerialNumber: string;
    renewalYear?: number;
    payload?: string;
    submittedByUserId: number;
    files?: UploadedRenewalFile[];
  }) {
    const eligibility = await this.validateEligibility(
      input.certificateSerialNumber,
      input.submittedByUserId,
    );

    const renewalYear = input.renewalYear || new Date().getFullYear();

    await assertRenewalSubmissionAllowed({
      organizationId: eligibility.organizationId,
      issueDate: new Date(eligibility.certification.issueDate),
      expiryDate: new Date(eligibility.certification.expiryDate),
      renewalYear,
    });
    const payloadObject = parseJsonPayload(input.payload ?? "{}");
    const payload = JSON.stringify(payloadObject);
    const files = input.files || [];
    const writtenPaths: string[] = [];
    const organizationUpdateData = getOrganizationUpdateData(payloadObject);

    try {
      if (files.length > 0) {
        const organizationName =
          eligibility.organization.nameEnglish ||
          eligibility.organization.nameAmharic ||
          `organization-${eligibility.organizationId}`;

        const filePaths = await writeRenewalFiles({
          organizationName,
          renewalYear,
          files,
        });

        writtenPaths.push(...filePaths);
      }

      // Map uploaded files by their fieldname to the written relative path
      const fileUrlByField: Record<string, string> = {};
      files.forEach((file, index) => {
        if (writtenPaths[index])
          fileUrlByField[file.fieldname] = writtenPaths[index];
      });

      const documentEntries = files.map((file, index) => ({
        organizationId: eligibility.organizationId,
        documentType: getDocumentTypeLabel(file.fieldname),
        fileUrl: writtenPaths[index],
        isVerified: false,
      }));

      return await prisma.$transaction(async (tx) => {
        if (Object.keys(organizationUpdateData).length > 0) {
          await tx.organization.update({
            where: { id: eligibility.organizationId },
            data: organizationUpdateData,
          });
        }

        const renewalApplication = await tx.application.create({
          data: {
            userId: input.submittedByUserId,
            organizationId: eligibility.organizationId,
            type: "Renewal",
            status: "Pending",
            // renewal-specific fields are stored in `RenewalApplication`
          },
          include: {
            organization: {
              select: {
                id: true,
                nameAmharic: true,
                nameEnglish: true,
                status: true,
                addressId: true,
              },
            },
          },
        });

        // Create normalized RenewalApplication row (store renewal metadata by organization)
        try {
          await (tx as any).renewalApplication.create({
            data: {
              organizationId: eligibility.organizationId,
              type: renewalApplication.type ?? "Renewal",
              sourceCertificationId: eligibility.certificateId ?? undefined,
              renewalYear: renewalYear ?? undefined,
            },
          });
        } catch (err) {
          // best-effort: if this fails, continue (transaction will still commit other changes)
        }

        if (documentEntries.length > 0) {
          await tx.organizationDocument.createMany({
            data: documentEntries,
          });
        }

        // Persist service contracts provided in payload
        try {
          const scs = Array.isArray(payloadObject.serviceContracts)
            ? payloadObject.serviceContracts
            : [];

          const orgAddressId =
            renewalApplication.organization?.addressId ?? null;

          for (const sc of scs) {
            const scObj =
              sc && typeof sc === "object"
                ? (sc as Record<string, unknown>)
                : {};
            const serviceUserName =
              String(
                scObj.serviceUserName ?? scObj.service_user_name ?? "",
              ).trim() || undefined;
            const assignedPersonnelCount =
              parseOptionalInt(
                scObj.assignedPersonnelCount ??
                  scObj.assigned_personnel_count ??
                  scObj.assignedPersonnelCount,
              ) ?? 0;

            // Determine addressId: prefer kebele -> create Address, else fallback to org address
            let addressId: number | null = orgAddressId ?? null;
            const kebeleVal = scObj.kebele ?? scObj.kebeleId ?? scObj.kebele_id;
            const kebeleId = parseOptionalInt(kebeleVal);
            if (kebeleId !== null) {
              const createdAddr = await tx.address.create({
                data: {
                  kebeleId,
                  houseNumber:
                    String(
                      scObj.houseNumber ?? scObj.house_number ?? "",
                    ).trim() || undefined,
                  specialLocation:
                    String(
                      scObj.specialLocation ?? scObj.special_location ?? "",
                    ).trim() || undefined,
                },
              });
              addressId = createdAddr.id;
            }

            const contractFileKey = `user_contract_${String(scObj.id ?? scObj.contractId ?? scObj.contract_id ?? "")}`;
            const contractUrl = fileUrlByField[contractFileKey] ?? undefined;

            if (addressId !== null) {
              await (tx as any).serviceContract.create({
                data: {
                  organizationId: eligibility.organizationId,
                  serviceUserName,
                  contractUrl: contractUrl ?? undefined,
                  addressId,
                  assignedPersonnelCount: assignedPersonnelCount ?? 0,
                },
              });
            }
          }
        } catch (err) {
          // best-effort: do not fail the transaction if service contract persistence has issues
        }

        // Persist training details if provided in payload
        try {
          const training = getTrainingData(payloadObject);
          const hasTraining =
            training.trainingBodyName ||
            training.trainingAddress ||
            training.trainingStartDate ||
            training.trainingEndDate ||
            training.trainingDurationDays !== null ||
            (training.totalTraineesMale || 0) > 0 ||
            (training.totalTraineesFemale || 0) > 0 ||
            (training.totalNotTraineesMale || 0) > 0 ||
            (training.totalNotTraineesFemale || 0) > 0;

          if (hasTraining) {
            const trainingData: Record<string, any> = {
              applicationId: renewalApplication.id,
              trainingBodyName: training.trainingBodyName ?? undefined,
              trainingAddress: training.trainingAddress ?? undefined,
              trainingDurationDays: training.trainingDurationDays ?? undefined,
              totalTraineesMale: training.totalTraineesMale ?? undefined,
              totalTraineesFemale: training.totalTraineesFemale ?? undefined,
              totalNotTraineesMale: training.totalNotTraineesMale ?? undefined,
              totalNotTraineesFemale:
                training.totalNotTraineesFemale ?? undefined,
            };

            if (training.trainingStartDate)
              trainingData.trainingStartDate = training.trainingStartDate;
            if (training.trainingEndDate)
              trainingData.trainingEndDate = training.trainingEndDate;

            await tx.organizationTrainingDetail.create({
              data: trainingData as any,
            });
          }
        } catch (err) {
          // best-effort: do not fail the entire transaction on training mapping errors
        }

        // Persist guard education level statistics if provided
        try {
          const edu = {
            grade_3_9_male:
              parseOptionalInt(
                payloadObject.grade3to9Male ?? payloadObject.grade_3_9_male,
              ) ?? 0,
            grade_3_9_female:
              parseOptionalInt(
                payloadObject.grade3to9Female ?? payloadObject.grade_3_9_female,
              ) ?? 0,
            grade_10_12_male:
              parseOptionalInt(
                payloadObject.grade10to12Male ?? payloadObject.grade_10_12_male,
              ) ?? 0,
            grade_10_12_female:
              parseOptionalInt(
                payloadObject.grade10to12Female ??
                  payloadObject.grade_10_12_female,
              ) ?? 0,
            certificate_male:
              parseOptionalInt(
                payloadObject.certificateMale ?? payloadObject.certificate_male,
              ) ?? 0,
            certificate_female:
              parseOptionalInt(
                payloadObject.certificateFemale ??
                  payloadObject.certificate_female,
              ) ?? 0,
            diploma_male:
              parseOptionalInt(
                payloadObject.diplomaMale ?? payloadObject.diploma_male,
              ) ?? 0,
            diploma_female:
              parseOptionalInt(
                payloadObject.diplomaFemale ?? payloadObject.diploma_female,
              ) ?? 0,
            degree_male:
              parseOptionalInt(
                payloadObject.degreeMale ?? payloadObject.degree_male,
              ) ?? 0,
            degree_female:
              parseOptionalInt(
                payloadObject.degreeFemale ?? payloadObject.degree_female,
              ) ?? 0,
            second_degree_male:
              parseOptionalInt(
                payloadObject.secondDegreeMale ??
                  payloadObject.second_degree_male,
              ) ?? 0,
            second_degree_female:
              parseOptionalInt(
                payloadObject.secondDegreeFemale ??
                  payloadObject.second_degree_female,
              ) ?? 0,
          };

          const anyEdu = Object.values(edu).some((v) => (v as number) > 0);
          if (anyEdu) {
            await (tx as any).guardEducationLevelStat.create({
              data: {
                organizationId: eligibility.organizationId,
                applicationId: renewalApplication.id,
                reportingDate: new Date(),
                ...edu,
              },
            });
          }
        } catch (err) {
          // best-effort: do not fail the transaction on education stats mapping errors
        }

        return renewalApplication;
      });
    } catch (error) {
      await cleanupWrittenFiles(writtenPaths);
      throw error;
    }
  }
}
