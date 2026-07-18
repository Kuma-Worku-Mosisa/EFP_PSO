// filepath: src/modules/application/application.service.ts
import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { NotificationService } from "../notification/notification.service";
import {
  ensureOrganizationFolders,
  getRelativeFilePath,
  sanitizeFolderSegment,
} from "../../middleware/fileUpload";
import {
  parseFieldName,
  getDocumentUrl,
  deleteDocumentFile,
  moveDocumentFile,
} from "../../utils/documentOrganizer";
import { createAuditLog } from "../../utils/auditLogger";
import {
  ApplicationTrackingService,
  type ApplicationTrackingStatusValue,
  ApplicationTrackingStatus,
} from "./application-tracking.service";
import { CertificationService } from "../certification/certification.service";

export class ApplicationService {
  private static async writeApplicationTrackingHistory(
    tx: Parameters<typeof ApplicationTrackingService.recordHistory>[0],
    applicationId: number,
    statusState: ApplicationTrackingStatusValue,
    remarks: string,
    changedBy: number,
  ) {
    await ApplicationTrackingService.recordHistory(tx, {
      applicationId,
      statusState,
      remarks,
      changedBy,
    });
  }

  /**
   * Helper: Extract and organize files by role from uploadedFiles map
   * Expected format: {role}_{documentType} -> filePath
   */
  private static organizeFilesByRole(
    uploadedFiles: Record<string, string>,
    prefix: string,
  ): Record<string, string> {
    const roleFiles: Record<string, string> = {};

    Object.entries(uploadedFiles)
      .filter(([key]) => key.startsWith(`${prefix}_`))
      .forEach(([key, filePath]) => {
        roleFiles[key] = filePath;
      });

    return roleFiles;
  }

  static async submitNewApplication(
    formData: any,
    uploadedFiles: Record<string, string>,
    userId: number,
  ) {
    try {
      console.log("[DEBUG] Starting application submission...");
      console.log("[DEBUG] Form data keys:", Object.keys(formData));
      console.log("[DEBUG] Uploaded files keys:", Object.keys(uploadedFiles));

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          faydaId: true,
        },
      });

      if (!currentUser) {
        throw new Error("Authenticated user could not be found");
      }

      // Validate kebele existence
      if (!formData.kebele) {
        throw new Error("Agency kebele is required");
      }

      const kebeleExists = await prisma.kebele.findUnique({
        where: { id: Number(formData.kebele) },
      });
      if (!kebeleExists) {
        throw new Error(
          `Kebele with ID ${formData.kebele} not found in database`,
        );
      }

      // Validate personnel kebeles
      const managerInput = formData.manager || {};
      const personnelKebeles = [
        managerInput.kebele,
        formData.ops?.kebele,
        formData.admin?.kebele,
      ].filter(Boolean);

      const normalizeOptionalNumber = (value: unknown): number | null => {
        if (value === null || value === undefined || value === "") {
          return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const normalizeOptionalText = (value: unknown): string | null => {
        if (typeof value !== "string") {
          return null;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      for (const kId of personnelKebeles) {
        const exists = await prisma.kebele.findUnique({
          where: { id: Number(kId) },
        });
        if (!exists) {
          throw new Error(
            `Personnel kebele with ID ${kId} not found in database`,
          );
        }
      }

      const branchAddresses = (
        Array.isArray(formData.branchAddresses) ? formData.branchAddresses : []
      )
        .filter((branch: any) => branch?.kebeleId)
        .map((branch: any) => ({
          kebeleId: Number(branch.kebeleId),
          houseNumber: normalizeOptionalText(branch.houseNumber),
          specialLocation: normalizeOptionalText(branch.specialLocation),
        }));

      for (const branch of branchAddresses) {
        if (!Number.isFinite(branch.kebeleId) || branch.kebeleId <= 0) {
          throw new Error("Each branch address must include a valid kebele");
        }

        const exists = await prisma.kebele.findUnique({
          where: { id: branch.kebeleId },
        });
        if (!exists) {
          throw new Error(
            `Branch kebele with ID ${branch.kebeleId} not found in database`,
          );
        }
      }

      console.log("[DEBUG] Kebele validation passed");

      const parseBooleanFromInput = (value: unknown): boolean => {
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
          const normalized = value.trim().toLowerCase();
          if (normalized === "true") return true;
          if (normalized === "false") return false;
        }
        return false;
      };

      const hasStoreHouse = parseBooleanFromInput(formData.hasStoreHouse);

      // Ensure organization folder structure exists for document storage
      // Prefer explicit bilingual fields; fall back to legacy `agencyName` for compatibility
      const orgFolderDisplayName =
        formData.agencyNameEnglish ||
        formData.agencyNameAmharic ||
        formData.agencyName ||
        `org_${Date.now()}`;
      console.log(
        "[DEBUG] Ensuring folder structure for organization:",
        orgFolderDisplayName,
      );
      const orgFolderPath = ensureOrganizationFolders(orgFolderDisplayName);
      console.log(
        "[DEBUG] Organization folder structure ready:",
        orgFolderPath,
      );

      const movePersonnelDocumentsIntoNameFolder = (
        prefix: "manager" | "ops" | "admin",
        fullName: string | null | undefined,
      ) => {
        const safeFullName = sanitizeFolderSegment(String(fullName || ""));

        if (!safeFullName || safeFullName === "unknown") {
          return;
        }

        const roleFolder =
          prefix === "ops"
            ? "operations"
            : prefix === "admin"
              ? "administrator"
              : "manager";

        for (const [key, rawValue] of Object.entries(uploadedFiles || {})) {
          if (!rawValue || !key.startsWith(`${prefix}_`)) {
            continue;
          }

          const relativePath = String(rawValue).replace(/^\/+/, "");
          const normalizedPath = relativePath.replace(/\\/g, "/");
          const pathParts = normalizedPath.split("/").filter(Boolean);
          const roleIndex = pathParts.findIndex((part) => part === roleFolder);

          if (roleIndex === -1 || !pathParts[roleIndex + 1]) {
            continue;
          }

          if (pathParts[roleIndex + 1] === safeFullName) {
            continue;
          }

          const fileName = pathParts[pathParts.length - 1];
          const targetPathParts = pathParts.slice(0, roleIndex + 1);
          const targetRelativePath = [
            ...targetPathParts,
            safeFullName,
            fileName,
          ].join("/");

          const moved = moveDocumentFile(relativePath, targetRelativePath);
          if (moved) {
            uploadedFiles[key] = getDocumentUrl(targetRelativePath);
            movedFinalPaths.push(targetRelativePath);
          }
        }
      };

      // Move staged files from _tmp to final location before transaction.
      const movedFinalPaths: string[] = [];
      const stagedPrefix = "/uploads/_tmp/";

      const movedSources = new Set<string>();

      for (const [key, val] of Object.entries(uploadedFiles || {})) {
        if (!val) continue;
        const url = String(val);
        // detect staged paths returned by upload (e.g. "/uploads/_tmp/Org/role/file")
        if (url.includes(stagedPrefix) || url.startsWith("uploads/_tmp/")) {
          const relTemp = url.startsWith("/") ? url.slice(1) : url; // remove leading /
          if (movedSources.has(relTemp)) {
            uploadedFiles[key] = getDocumentUrl(relTemp.replace("_tmp/", ""));
            continue;
          }
          const relFinal = relTemp.replace("_tmp/", "");
          const moved = moveDocumentFile(relTemp, relFinal);
          if (!moved) {
            // rollback any moves we've already done
            for (const movedRel of movedFinalPaths) {
              try {
                deleteDocumentFile(movedRel);
              } catch (e) {
                console.error(
                  "[ERROR] Failed to cleanup moved file after move failure",
                  e,
                );
              }
            }
            throw new Error(
              `Failed to move staged file ${relTemp} to final location`,
            );
          }
          // Update the uploadedFiles map to point to final URL format
          uploadedFiles[key] = getDocumentUrl(relFinal);
          movedFinalPaths.push(relFinal);
          movedSources.add(relTemp);
        }
      }

      movePersonnelDocumentsIntoNameFolder("manager", currentUser.fullName);
      movePersonnelDocumentsIntoNameFolder("ops", formData.ops?.fullName);
      movePersonnelDocumentsIntoNameFolder("admin", formData.admin?.fullName);

      const uploadedFileUrls =
        movedFinalPaths.length > 0
          ? movedFinalPaths
          : Object.values(uploadedFiles || {});

      try {
        const result = await prisma.$transaction(async (tx) => {
          // All persistent application submission writes are run inside one
          // atomic transaction. This ensures ACID behavior for organization,
          // personnel, application, training, documents, and tracking history.
          // Using SERIALIZABLE isolation reduces race conditions for this
          // submission flow, while commit/rollback guarantees atomicity.
          // Note: audit log failures are intentionally non-fatal to avoid
          // blocking the main application submission flow.

          // 1. Create Organization Address
          console.log(
            "[DEBUG] Creating organization address for kebele:",
            formData.kebele,
          );
          const orgAddress = await tx.address.create({
            data: {
              kebeleId: Number(formData.kebele),
              houseNumber: formData.houseNumber,
              specialLocation: formData.specialLocation || null,
            },
          });
          console.log("[DEBUG] Organization address created:", orgAddress.id);

          // 2. Create Organization
          console.log("[DEBUG] Creating organization:", orgFolderDisplayName);
          const organization = await tx.organization.create({
            data: {
              // store both language variants when provided; fall back to legacy `agencyName`
              nameAmharic:
                formData.agencyNameAmharic || formData.agencyName || null,
              nameEnglish:
                formData.agencyNameEnglish || formData.agencyName || null,
              email: formData.email,
              phone: formData.phone,
              faxNumber: formData.faxNumber || null,
              tradeName: formData.tradeName || null,
              tinNumber: formData.tinNumber || null,
              // licenseNumber: formData.licenseNumber || null,
              addressId: orgAddress.id,
              numberOfOffices: Number(formData.numberOfOffices),
              numberOfComputers: Number(formData.numberOfComputers),
              numberOfVehicles: Number(formData.numberOfVehicles),
              hasStoreHouse,
              capitalAmount: formData.capitalAmount,
              status: "Pending",
            } as any,
          });

          // Audit: organization creation
          try {
            await createAuditLog(tx, {
              userId,
              action: "CREATE",
              entityName: "Organization",
              entityId: organization.id,
              oldValue: null,
              newValue: JSON.stringify({
                id: organization.id,
                nameAmharic: (organization as any).nameAmharic,
                nameEnglish: (organization as any).nameEnglish,
              }),
              ipAddress: null,
              userAgent: null,
            });
          } catch (e) {
            console.warn("[WARN] Audit log failed for organization create", e);
          }

          // 2b. Create optional branch addresses (zero or more)
          if (branchAddresses.length > 0) {
            console.log(
              "[DEBUG] Creating organization branches:",
              branchAddresses.length,
            );
            for (const branch of branchAddresses) {
              const branchAddress = await tx.address.create({
                data: {
                  kebeleId: branch.kebeleId,
                  houseNumber: branch.houseNumber,
                  specialLocation: branch.specialLocation,
                },
              });

              await tx.organizationBranch.create({
                data: {
                  organizationId: organization.id,
                  addressId: branchAddress.id,
                },
              });
            }
          }

          // 3. Helper Function: Register Personnel (Address -> User -> Employee -> Docs)
          const registerPersonnel = async (personData: any, prefix: string) => {
            if (!personData) {
              console.log(
                `[DEBUG] ${prefix} data is null, skipping registration`,
              );
              return null;
            }

            const sourceData =
              prefix === "manager"
                ? {
                    ...personData,
                    fullName: currentUser.fullName,
                    email: currentUser.email,
                    phone: currentUser.phone,
                    faydaId: currentUser.faydaId,
                  }
                : personData;

            console.log(`[DEBUG] Registering ${prefix}:`, {
              fullName: sourceData.fullName,
              email: sourceData.email,
              faydaId: sourceData.faydaId,
              kebele: sourceData.kebele,
            });

            // Validate required fields
            if (
              !sourceData.fullName ||
              !sourceData.email ||
              !sourceData.faydaId ||
              !sourceData.kebele
            ) {
              throw new Error(
                `${prefix} missing required fields: fullName, email, faydaId, or kebele`,
              );
            }

            // A. Create the Personal Address for the employee
            const personalAddress = await tx.address.create({
              data: {
                kebeleId: Number(sourceData.kebele),
                houseNumber: sourceData.houseNo || null,
                specialLocation: sourceData.specialLocation || null,
              },
            });

            const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);

            // B. Create User Account
            const user =
              prefix === "manager"
                ? currentUser
                : await tx.user.create({
                    data: {
                      fullName: sourceData.fullName,
                      username: `${prefix}_${uniqueSuffix}`,
                      email: sourceData.email,
                      phone: sourceData.phone,
                      password: "hashed_password_placeholder",
                      faydaId: sourceData.faydaId,
                    },
                  });

            // C. Create Employee Profile linked to Organization and Address
            const employee = await tx.employee.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                organizationId: organization.id,
                addressId: personalAddress.id,
                positionId: normalizeOptionalNumber(sourceData.positionId),
                educationLevel: normalizeOptionalText(
                  sourceData.educationLevel,
                ),
                workExpYears:
                  normalizeOptionalNumber(
                    sourceData.workExpYears ?? sourceData.workExperienceYears,
                  ) ?? 0,
                TotalExpYears:
                  normalizeOptionalNumber(
                    sourceData.TotalExpYears ??
                      sourceData.totalExpYears ??
                      sourceData.totalExperienceYears,
                  ) ?? 0,
                employmentStatus: "PENDING",
                gender: sourceData.gender,
                citizenship: sourceData.citizenship,
              },
              update: {
                organizationId: organization.id,
                addressId: personalAddress.id,
                positionId: normalizeOptionalNumber(sourceData.positionId),
                educationLevel: normalizeOptionalText(
                  sourceData.educationLevel,
                ),
                workExpYears:
                  normalizeOptionalNumber(
                    sourceData.workExpYears ?? sourceData.workExperienceYears,
                  ) ?? 0,
                TotalExpYears:
                  normalizeOptionalNumber(
                    sourceData.TotalExpYears ??
                      sourceData.totalExpYears ??
                      sourceData.totalExperienceYears,
                  ) ?? 0,
                employmentStatus: "PENDING",
                gender: sourceData.gender,
                citizenship: sourceData.citizenship,
              },
            });

            // D. Prepare Employee Documents based on uploadedFiles keys

            const docMapping = [
              { key: "education_doc", type: "Education Certificate" },
              {
                key: "id_passport_or_kabele_doc",
                type: "National ID/Passport",
              },
              { key: "fingerprint_doc", type: "Fingerprint" },
              { key: "medical_doc", type: "Medical Certificate" },
              { key: "training_doc", type: "Training Certificate" },
              { key: "support_doc", type: "Supporting Document" },
              { key: "guarantee_doc", type: "Proof of Guarantee" },
              { key: "experience_doc", type: "Experience Certificate" },
              { key: "resignation_letter_doc", type: "Resignation Letter" },
              { key: "organization_Id_doc", type: "Organization ID Document" },
            ];

            console.log(
              `[DEBUG] ${prefix} looking for documents with keys:`,
              Object.keys(uploadedFiles).filter((k) => k.startsWith(prefix)),
            );

            // Get mapped documents
            const empDocs = docMapping
              .filter((doc) => uploadedFiles[`${prefix}_${doc.key}`])
              .map((doc) => ({
                employeeId: employee.id,
                documentType: doc.type,
                fileUrl: uploadedFiles[`${prefix}_${doc.key}`],
              }));

            // Also include any additional documents with the ${prefix}_* pattern that aren't already mapped
            const mappedKeys = new Set(
              docMapping.map((d) => `${prefix}_${d.key}`),
            );
            const additionalDocs = Object.entries(uploadedFiles)
              .filter(
                ([key]) =>
                  key.startsWith(`${prefix}_`) &&
                  !mappedKeys.has(key) &&
                  !["education_doc", "id_passport_or_kabele_doc"].some((k) =>
                    key.endsWith(k),
                  ),
              )
              .map(([key, fileUrl]) => ({
                employeeId: employee.id,
                documentType: key
                  .replace(`${prefix}_`, "")
                  .replace(/_/g, " ")
                  .toUpperCase(),
                fileUrl,
              }));

            const allEmpDocs = [...empDocs, ...additionalDocs];
            console.log(
              `[DEBUG] ${prefix} found ${allEmpDocs.length} documents total (${empDocs.length} mapped + ${additionalDocs.length} additional)`,
            );

            if (allEmpDocs.length > 0) {
              await tx.employeeDocument.createMany({ data: allEmpDocs });
            }

            // Audit: employee creation
            try {
              await createAuditLog(tx, {
                userId,
                action: "CREATE",
                entityName: "Employee",
                entityId: employee.id,
                oldValue: null,
                newValue: JSON.stringify({
                  id: employee.id,
                  userId: user.id,
                  organizationId: organization.id,
                }),
                ipAddress: null,
                userAgent: null,
              });
            } catch (e) {
              console.warn("[WARN] Audit log failed for employee create", e);
            }

            console.log(
              `[DEBUG] ${prefix} registration complete. Employee ID: ${employee.id}`,
            );
            return employee.id;
          };

          // 4. Register the 3 Personnel Roles (Step 5 Data)
          console.log("[DEBUG] Registering manager...");
          const managerId = await registerPersonnel(managerInput, "manager");
          console.log("[DEBUG] Registering ops...");
          const opsHeadId = await registerPersonnel(formData.ops, "ops");
          console.log("[DEBUG] Registering admin...");
          const adminHeadId = await registerPersonnel(formData.admin, "admin");

          // 5. Create the License Application
          console.log("[DEBUG] Creating application with:", {
            managerId,
            opsHeadId,
            adminHeadId,
          });
          const application = await tx.application.create({
            data: {
              userId: userId,
              organizationId: organization.id,
              type: "NEW_LICENSE",
              status: "Pending",
              managerId: managerId,
              operationsHeadId: opsHeadId,
              adminHeadId: adminHeadId,
            },
          });

          // Audit: application creation
          try {
            await createAuditLog(tx, {
              userId,
              action: "CREATE",
              entityName: "Application",
              entityId: application.id,
              oldValue: null,
              newValue: JSON.stringify({
                id: application.id,
                organizationId: organization.id,
                organizationNameEnglish: organization.nameEnglish,
                organizationNameAmharic: organization.nameAmharic,
                status: application.status,
              }),
              ipAddress: null,
              userAgent: null,
            });
          } catch (e) {
            console.warn("[WARN] Audit log failed for application create", e);
          }

          // 6. Save Training Details (Step 4 Data)
          console.log("[DEBUG] Creating training details...");
          await tx.organizationTrainingDetail.create({
            data: {
              applicationId: application.id,
              trainingBodyName: formData.trainingProvider,
              trainingAddress: formData.trainingAddress,
              trainingStartDate: formData.trainingStartDate
                ? new Date(formData.trainingStartDate)
                : new Date(),
              trainingEndDate: formData.trainingEndDate
                ? new Date(formData.trainingEndDate)
                : new Date(),
              trainingDurationDays: Number(formData.trainingDays || 0),
              totalTraineesMale: Number(formData.totalTraineesMale) || 0,
              totalTraineesFemale: Number(formData.totalTraineesFemale) || 0,
              totalNotTraineesMale:
                Number(
                  formData.totalMaleUntrained ?? formData.totalNotTraineesMale,
                ) || 0,
              totalNotTraineesFemale:
                Number(
                  formData.totalFemaleUntrained ??
                    formData.totalNotTraineesFemale,
                ) || 0,
            },
          });
          // 7. Process General Organization Documents
          console.log("[DEBUG] Processing organization documents...");
          const coreAssetKeys = [
            "logo",
            "uniform_sample",
            "id_sample",
            "training_manual",
            "training_cert",
          ];
          const empPrefixes = ["manager_", "ops_", "admin_"];

          const coreAssetDocMapping: Record<string, string> = {
            logo: "Organization Logo",
            uniform_sample: "Uniform Sample",
            id_sample: "ID Card Sample",
            training_manual: "Training Manual",
            training_cert: "Training Certificate",
          };

          const coreAssetDocumentEntries = Object.entries(uploadedFiles)
            .filter(([key]) => coreAssetDocMapping[key])
            .map(([key, url]) => ({
              organizationId: organization.id,
              documentType: coreAssetDocMapping[key],
              fileUrl: url,
              isVerified: false,
              issuedDate: new Date(),
            }));

          const orgDocTypeMapping: Record<string, string> = {
            trade_name_designation: "Trade Name Designation",
            trade_pre_registration: "Trade Name Pre-Registration",
            renewed_trade_license: "Renewed Trade License",
            labor_and_skill_bureau: "Labor and Skill Bureau Registration",
            tin_number_paper: "TIN Number Paper",
            organizational_trademark: "Organizational Trademark",
            org_structure: "Organizational Structure",
            articles_of_incorporation: "Articles of Incorporation",
            internal_regulations: "Internal Regulations",
            tech_list_used: "List of Technologies Used",
            bank_statement_capital: "Capital (Bank Statement)",
          };

          const orgDocumentEntries = Object.entries(uploadedFiles)
            .filter(
              ([key]) =>
                !coreAssetKeys.includes(key) &&
                !empPrefixes.some((p) => key.startsWith(p)),
            )
            .map(([key, url]) => ({
              organizationId: organization.id,
              documentType:
                orgDocTypeMapping[key] || key.toUpperCase().replace("_", " "),
              fileUrl: url,
              isVerified: false,
              issuedDate: new Date(),
            }));

          const allOrganizationDocumentEntries = [
            ...coreAssetDocumentEntries,
            ...orgDocumentEntries,
          ];

          if (allOrganizationDocumentEntries.length > 0) {
            await tx.organizationDocument.createMany({
              data: allOrganizationDocumentEntries,
            });
          }

          // 8. Log History
          console.log("[DEBUG] Creating application tracking history...");
          await this.writeApplicationTrackingHistory(
            tx,
            application.id,
            ApplicationTrackingStatus.Pending,
            "Initial application submitted via system.",
            userId,
          );

          console.log("[DEBUG] Application submission completed successfully!");
          return { organization, application };
        });
        return result;
      } catch (txError) {
        console.error(
          "[ERROR] Transaction failed, attempting to cleanup uploaded files",
          txError,
        );
        try {
          for (const f of uploadedFileUrls) {
            if (!f) continue;
            const rel = f.startsWith("/") ? f.slice(1) : f;
            deleteDocumentFile(rel);
          }
        } catch (cleanupErr) {
          console.error(
            "[ERROR] Cleanup of uploaded files failed:",
            cleanupErr,
          );
        }
        throw txError;
      }
    } catch (error: any) {
      console.error("[ERROR] Application submission failed:", error.message);
      console.error("[ERROR] Stack:", error.stack);
      throw error;
    }
  }

  static async approveApplication(
    applicationId: number,
    userId: number,
    remarks: string,
  ) {
    try {
      console.log("[DEBUG] Approving application id:", applicationId);

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          organization: {
            include: { documents: true },
          },
          manager: {
            include: {
              documents: true,
            },
          },
          operationsHead: {
            include: {
              documents: true,
            },
          },
          adminHead: {
            include: {
              documents: true,
            },
          },
        },
      });

      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      const currentStatus = String(application.status).toLowerCase();
      if (currentStatus === "approved" || currentStatus === "rejected") {
        const error = new Error(
          `Application cannot be approved as it is already ${currentStatus}.`,
        ) as Error & {
          statusCode?: number;
        };
        error.statusCode = 409;
        throw error;
      }

      const unverifiedDocuments: Array<{ scope: string; id: number }> = [];

      const collectUnverified = (
        scope: string,
        docs?: Array<{ id: number; isVerified?: boolean }> | null,
      ) => {
        for (const doc of docs || []) {
          if (!doc?.isVerified) {
            unverifiedDocuments.push({ scope, id: doc.id });
          }
        }
      };

      collectUnverified("organization", application.organization?.documents);
      collectUnverified("manager", application.manager?.documents);
      collectUnverified(
        "manager-education",
        (application.manager?.documents || []).filter((d) =>
          String(d.documentType || "")
            .toLowerCase()
            .includes("education"),
        ),
      );
      collectUnverified(
        "operations-head",
        application.operationsHead?.documents,
      );
      collectUnverified(
        "operations-head-education",
        (application.operationsHead?.documents || []).filter((d) =>
          String(d.documentType || "")
            .toLowerCase()
            .includes("education"),
        ),
      );
      collectUnverified("admin-head", application.adminHead?.documents);
      collectUnverified(
        "admin-head-education",
        (application.adminHead?.documents || []).filter((d) =>
          String(d.documentType || "")
            .toLowerCase()
            .includes("education"),
        ),
      );

      if (unverifiedDocuments.length > 0) {
        const error = new Error(
          "Document not verified yet. Verify all organization and employee documents before approving this application.",
        ) as Error & { statusCode?: number; details?: unknown };
        error.statusCode = 400;
        error.details = unverifiedDocuments;
        throw error;
      }

      console.log("[DEBUG] Current application status:", application.status);

      // Update application status and organization status atomically
      let issuedCertificate: any = null;
      const result = await prisma.$transaction(async (tx) => {
        const updatedApp = await tx.application.update({
          where: { id: applicationId },
          data: { status: "Approved" },
        });

        // Optionally update organization status
        if (application.organization) {
          await tx.organization.update({
            where: { id: application.organizationId },
            data: { status: "Active" },
          });
        }

        await this.writeApplicationTrackingHistory(
          tx,
          applicationId,
          ApplicationTrackingStatus.Approved,
          remarks,
          userId,
        );

        issuedCertificate = await CertificationService.issueCertificate(
          {
            applicationId,
            organizationId: application.organizationId,
            level: 3,
          },
          tx,
        );

        return updatedApp;
      });

      console.log("[DEBUG] Application approved successfully:", applicationId);
      console.log(
        "[DEBUG] Notifying stakeholders (simulated) for application:",
        applicationId,
      );
      // Send real notification to applicant (if present)
      try {
        const recipientId = application.userId;
        const orgNameEn =
          application.organization?.nameEnglish || "Your Organization";
        const orgNameAm = application.organization?.nameAmharic || "ድርጅትዎ";

        if (recipientId) {
          void NotificationService.sendBilingualAlert(
            Number(recipientId),
            "APPROVED",
            {
              organizationName: orgNameEn,
              organizationNameAm: orgNameAm,
              certificateSerial:
                issuedCertificate?.certificateSerialNumber || "N/A",
            },
          );
        }
      } catch (notifyErr) {
        console.error("[Notification Error] approveApplication:", notifyErr);
      }
      return result;
    } catch (error: any) {
      console.error(
        "[ERROR] Approve application failed:",
        error?.message || error,
      );
      throw error;
    }
  }

  static async rejectApplication(
    applicationId: number,
    userId: number,
    remarks: string,
  ) {
    try {
      console.log("[DEBUG] Rejecting application id:", applicationId);

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { organization: true },
      });

      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      const currentStatus = String(application.status).toLowerCase();
      if (currentStatus === "approved" || currentStatus === "rejected") {
        const error = new Error(
          `Application cannot be rejected as it is already ${currentStatus}.`,
        ) as Error & {
          statusCode?: number;
        };
        error.statusCode = 409;
        throw error;
      }

      console.log("[DEBUG] Current application status:", application.status);

      const result = await prisma.$transaction(async (tx) => {
        const updatedApp = await tx.application.update({
          where: { id: applicationId },
          data: { status: "Rejected" },
        });

        // Optionally update organization status
        if (application.organization) {
          await tx.organization.update({
            where: { id: application.organizationId },
            data: { status: "Rejected" },
          });
        }

        await this.writeApplicationTrackingHistory(
          tx,
          applicationId,
          ApplicationTrackingStatus.Rejected,
          remarks,
          userId,
        );

        return updatedApp;
      });

      console.log("[DEBUG] Application rejected:", applicationId);
      console.log(
        "[DEBUG] Notifying applicant (simulated) for application:",
        applicationId,
      );
      // Send real notification to applicant about rejection
      try {
        const recipientId = application.userId;
        const orgNameEn =
          application.organization?.nameEnglish || "Your Organization";
        const orgNameAm = application.organization?.nameAmharic || "ድርጅትዎ";

        if (recipientId) {
          await NotificationService.sendBilingualAlert(
            Number(recipientId),
            "REJECTED",
            {
              organizationName: orgNameEn,
              organizationNameAm: orgNameAm,
              customDetailsEn: remarks,
              customDetailsAm: remarks,
            },
          );
        }
      } catch (notifyErr) {
        console.error("[Notification Error] rejectApplication:", notifyErr);
      }
      return result;
    } catch (error: any) {
      console.error(
        "[ERROR] Reject application failed:",
        error?.message || error,
      );
      throw error;
    }
  }

  static async requestCorrection(
    applicationId: number,
    userId: number,
    remarks: string,
  ) {
    try {
      console.log(
        "[DEBUG] Requesting correction for application id:",
        applicationId,
      );

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { organization: true },
      });

      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      const currentStatus = String(application.status).toLowerCase();
      if (currentStatus === "approved" || currentStatus === "rejected") {
        const error = new Error(
          `Application cannot be corrected as it is already ${currentStatus}.`,
        ) as Error & {
          statusCode?: number;
        };
        error.statusCode = 409;
        throw error;
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedApp = await tx.application.update({
          where: { id: applicationId },
          data: { status: "Correction Requested" },
        });

        if (application.organization) {
          await tx.organization.update({
            where: { id: application.organizationId },
            data: { status: "Correction Requested" },
          });
        }

        await this.writeApplicationTrackingHistory(
          tx,
          applicationId,
          ApplicationTrackingStatus.CorrectionRequested,
          remarks,
          userId,
        );

        return updatedApp;
      });

      console.log("[DEBUG] Application marked for correction:", applicationId);
      return result;
    } catch (error: any) {
      console.error(
        "[ERROR] Request correction failed:",
        error?.message || error,
      );
      throw error;
    }
  }

  static async markUnderReview(
    applicationId: number,
    userId: number,
    remarks: string,
  ) {
    try {
      console.log(
        "[DEBUG] Marking application as under review:",
        applicationId,
      );

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { organization: true },
      });

      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      const currentStatus = String(application.status).toLowerCase();
      if (currentStatus === "approved" || currentStatus === "rejected") {
        const error = new Error(
          `Application cannot be marked as under review as it is already ${currentStatus}.`,
        ) as Error & {
          statusCode?: number;
        };
        error.statusCode = 409;
        throw error;
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedApp = await tx.application.update({
          where: { id: applicationId },
          data: { status: "Reviewing" },
        });

        if (application.organization) {
          await tx.organization.update({
            where: { id: application.organizationId },
            data: { status: "Under Review" },
          });
        }

        await this.writeApplicationTrackingHistory(
          tx,
          applicationId,
          ApplicationTrackingStatus.Reviewing,
          remarks,
          userId,
        );

        return updatedApp;
      });

      console.log("[DEBUG] Application marked under review:", applicationId);
      return result;
    } catch (error: any) {
      console.error(
        "[ERROR] Mark under review failed:",
        error?.message || error,
      );
      throw error;
    }
  }

  static async listApplications() {
    try {
      const rows = await prisma.application.findMany({
        orderBy: [{ applicationDate: "asc" }, { id: "asc" }],
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
              serviceContracts: {
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
                orderBy: { createdAt: "desc" },
              },
              branches: {
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
              documents: true,
            },
          },
          manager: {
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
              documents: true,
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
          operationsHead: {
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
              documents: true,
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
          adminHead: {
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
              documents: true,
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
          trainingDetails: {
            orderBy: { createdAt: "desc" },
          },
          guardEducationStats: {
            orderBy: { createdAt: "desc" },
          },
          history: {
            orderBy: { changedAt: "desc" },
          },
        },
      });

      const toFileList = (
        docs: Array<{
          id?: number;
          documentType?: string;
          fileUrl?: string;
          isVerified?: boolean;
          verifiedAt?: Date | string | null;
        }>,
      ) =>
        (docs || []).map((doc) => ({
          id: doc.id,
          documentType: doc.documentType,
          fileUrl: doc.fileUrl,
          fileName: doc.fileUrl
            ? doc.fileUrl.split("/").pop() || doc.fileUrl
            : doc.documentType,
          isVerified: Boolean(doc.isVerified),
          verifiedAt: doc.verifiedAt
            ? new Date(doc.verifiedAt).toISOString()
            : null,
        }));

      const serializeAddress = (address: any) => {
        if (!address) return null;

        return {
          houseNumber: address.houseNumber,
          specialLocation: address.specialLocation,
          kebele: address.kebele
            ? {
                name:
                  address.kebele.nameEnglish ||
                  address.kebele.nameAmharic ||
                  null,
                nameEnglish: address.kebele.nameEnglish,
                nameAmharic: address.kebele.nameAmharic,
                woreda: address.kebele.woreda
                  ? {
                      name:
                        address.kebele.woreda.nameEnglish ||
                        address.kebele.woreda.nameAmharic ||
                        null,
                      nameEnglish: address.kebele.woreda.nameEnglish,
                      nameAmharic: address.kebele.woreda.nameAmharic,
                      zone: address.kebele.woreda.zone
                        ? {
                            name:
                              address.kebele.woreda.zone.nameEnglish ||
                              address.kebele.woreda.zone.nameAmharic ||
                              null,
                            nameEnglish: address.kebele.woreda.zone.nameEnglish,
                            nameAmharic: address.kebele.woreda.zone.nameAmharic,
                            region: address.kebele.woreda.zone.region
                              ? {
                                  name:
                                    address.kebele.woreda.zone.region
                                      .nameEnglish ||
                                    address.kebele.woreda.zone.region
                                      .nameAmharic ||
                                    null,
                                  nameEnglish:
                                    address.kebele.woreda.zone.region
                                      .nameEnglish,
                                  nameAmharic:
                                    address.kebele.woreda.zone.region
                                      .nameAmharic,
                                }
                              : null,
                          }
                        : null,
                    }
                  : null,
              }
            : null,
        };
      };

      const serializeEmployee = (employee: any) => {
        if (!employee) return null;

        return {
          id: employee.id,
          positionId: employee.positionId ?? null,
          user: employee.user,
          gender: employee.gender,
          citizenship: employee.citizenship,
          educationLevel: employee.educationLevel ?? null,
          workExpYears: employee.workExpYears ?? 0,
          TotalExpYears: employee.TotalExpYears ?? 0,
          isBlacklisted: Boolean(employee.isBlacklisted),
          address: employee.address,
          // Derive education documents from general documents by filtering types
          educationDocs: toFileList(
            (employee.documents || []).filter((d: { documentType?: string }) =>
              String(d.documentType || "")
                .toLowerCase()
                .includes("education"),
            ),
          ),
          documents: toFileList(employee.documents || []),
        };
      };

      return rows.map((r) => {
        const organization = r.organization as any;
        const latestTraining = r.trainingDetails?.[0] as any;
        const latestGuardEducationStat = r.guardEducationStats?.[0] as any;
        const organizationDocs = organization?.documents || [];

        const findOrganizationDocUrl = (documentName: string) => {
          const normalizedName = String(documentName || "").toLowerCase();
          const doc = organizationDocs.find((entry: any) => {
            const type = String(entry?.documentType || "").toLowerCase();
            return type.includes(normalizedName);
          });

          return doc?.fileUrl || null;
        };

        const displayOrgName =
          organization?.nameEnglish || organization?.nameAmharic || "";

        return {
          id: r.id,
          applicantFullName: r.user?.fullName || "-",
          user: r.user,
          agency: displayOrgName,
          type: r.type,
          date: r.applicationDate
            ? r.applicationDate.toISOString().split("T")[0]
            : null,
          status: r.status,
          organization: organization
            ? {
                id: organization.id,
                nameEnglish: organization.nameEnglish,
                nameAmharic: organization.nameAmharic,
                // Keep compatibility for older frontend fields (English-first fallback).
                name:
                  organization.nameEnglish || organization.nameAmharic || null,
                headOfficeName:
                  organization.nameEnglish || organization.nameAmharic || null,
                email: organization.email,
                phone: organization.phone,
                faxNumber: organization.faxNumber,
                tradeName: organization.tradeName,
                tinNumber: organization.tinNumber,
                numberOfOffices: organization.numberOfOffices,
                numberOfVehicles: organization.numberOfVehicles,
                numberOfComputers: organization.numberOfComputers,
                hasStoreHouse: organization.hasStoreHouse,
                capitalAmount: organization.capitalAmount,
                logoUrl: findOrganizationDocUrl("organization logo"),
                uniformSampleUrl: findOrganizationDocUrl("uniform sample"),
                idCardSampleUrl: findOrganizationDocUrl("id card sample"),
                address: serializeAddress(organization.address),
                branchAddresses: (organization.branches || []).map(
                  (branch: any) => ({
                    id: branch.id,
                    address: serializeAddress(branch.address),
                  }),
                ),
                documents: toFileList(organization.documents || []),
                serviceContracts: (organization.serviceContracts || []).map(
                  (contract: any) => ({
                    id: contract.id,
                    serviceUserName: contract.serviceUserName,
                    contractUrl: contract.contractUrl,
                    assignedPersonnelCount: contract.assignedPersonnelCount,
                    address: serializeAddress(contract.address),
                  }),
                ),
                educationStats: latestGuardEducationStat
                  ? {
                      grade_3_9_male: latestGuardEducationStat.grade_3_9_male,
                      grade_3_9_female:
                        latestGuardEducationStat.grade_3_9_female,
                      grade_10_12_male:
                        latestGuardEducationStat.grade_10_12_male,
                      grade_10_12_female:
                        latestGuardEducationStat.grade_10_12_female,
                      certificate_male:
                        latestGuardEducationStat.certificate_male,
                      certificate_female:
                        latestGuardEducationStat.certificate_female,
                      diploma_male: latestGuardEducationStat.diploma_male,
                      diploma_female: latestGuardEducationStat.diploma_female,
                      degree_male: latestGuardEducationStat.degree_male,
                      degree_female: latestGuardEducationStat.degree_female,
                      second_degree_male:
                        latestGuardEducationStat.second_degree_male,
                      second_degree_female:
                        latestGuardEducationStat.second_degree_female,
                    }
                  : null,
              }
            : null,
          manager: serializeEmployee(r.manager),
          operationsHead: serializeEmployee(r.operationsHead),
          adminHead: serializeEmployee(r.adminHead),
          training: latestTraining
            ? {
                id: latestTraining.id,
                trainingBodyName: latestTraining.trainingBodyName,
                trainingAddress: latestTraining.trainingAddress,
                trainingStartDate: latestTraining.trainingStartDate,
                trainingEndDate: latestTraining.trainingEndDate,
                trainingDurationDays: latestTraining.trainingDurationDays,
                trainingManualUrl: findOrganizationDocUrl("training manual"),
                trainingCertificateUrl: findOrganizationDocUrl(
                  "training certificate",
                ),
                totalTraineesMale: latestTraining.totalTraineesMale,
                totalTraineesFemale: latestTraining.totalTraineesFemale,
              }
            : null,
          guardEducationStat: latestGuardEducationStat
            ? {
                id: latestGuardEducationStat.id,
                grade_3_9_male: latestGuardEducationStat.grade_3_9_male,
                grade_3_9_female: latestGuardEducationStat.grade_3_9_female,
                grade_10_12_male: latestGuardEducationStat.grade_10_12_male,
                grade_10_12_female: latestGuardEducationStat.grade_10_12_female,
                certificate_male: latestGuardEducationStat.certificate_male,
                certificate_female: latestGuardEducationStat.certificate_female,
                diploma_male: latestGuardEducationStat.diploma_male,
                diploma_female: latestGuardEducationStat.diploma_female,
                degree_male: latestGuardEducationStat.degree_male,
                degree_female: latestGuardEducationStat.degree_female,
                second_degree_male: latestGuardEducationStat.second_degree_male,
                second_degree_female:
                  latestGuardEducationStat.second_degree_female,
              }
            : null,
          history: (r.history || []).map((entry: any) => ({
            id: entry.id,
            statusState: entry.statusState,
            remarks: entry.remarks,
            changedAt: entry.changedAt,
            changedBy: entry.changedBy,
          })),
        };
      });
    } catch (error: any) {
      console.error("[ERROR] listApplications failed", error?.message || error);
      throw error;
    }
  }

  static async getApplicationTrackingHistory(applicationId: number) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        inspections: {
          orderBy: [{ scheduledDate: "desc" }, { id: "desc" }],
          take: 1,
          include: {
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
        },
      },
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const history =
      await ApplicationTrackingService.getHistoryByApplicationId(applicationId);

    return {
      applicationId,
      totalEvents: history.length,
      history,
      inspection: application.inspections?.[0]
        ? {
            id: application.inspections[0].id,
            scheduledDate: application.inspections[0].scheduledDate,
            status: application.inspections[0].status,
            findingsSummary: application.inspections[0].findingsSummary,
            expertOpinion: application.inspections[0].expertOpinion,
            finalReportUrl: application.inspections[0].finalReportUrl,
            leadInspector: application.inspections[0].leadInspector,
            committeeMembers: application.inspections[0].committeeMembers,
          }
        : null,
    };
  }

  static async verifyDocument(
    scope: string,
    documentId: number,
    userId: number,
  ) {
    const verifiedAt = new Date();

    try {
      if (scope === "organization") {
        const updated = await prisma.organizationDocument.update({
          where: { id: documentId },
          data: { isVerified: true, verifiedAt },
        });

        try {
          await createAuditLog(prisma, {
            userId,
            action: "UPDATE",
            entityName: "OrganizationDocument",
            entityId: updated.id,
            oldValue: null,
            newValue: JSON.stringify({
              id: updated.id,
              isVerified: updated.isVerified,
              verifiedAt: updated.verifiedAt,
            }),
            ipAddress: null,
            userAgent: null,
          });
        } catch (auditError) {
          console.warn(
            "[WARN] Audit log failed for organization document verify",
            auditError,
          );
        }

        return updated;
      }

      if (scope === "employee") {
        const updated = await prisma.employeeDocument.update({
          where: { id: documentId },
          data: { isVerified: true, verifiedAt },
        });

        try {
          await createAuditLog(prisma, {
            userId,
            action: "UPDATE",
            entityName: "EmployeeDocument",
            entityId: updated.id,
            oldValue: null,
            newValue: JSON.stringify({
              id: updated.id,
              isVerified: updated.isVerified,
              verifiedAt: updated.verifiedAt,
            }),
            ipAddress: null,
            userAgent: null,
          });
        } catch (auditError) {
          console.warn(
            "[WARN] Audit log failed for employee document verify",
            auditError,
          );
        }

        return updated;
      }

      if (scope === "education") {
        const updated = await prisma.employeeDocument.update({
          where: { id: documentId },
          data: { isVerified: true, verifiedAt },
        });

        try {
          await createAuditLog(prisma, {
            userId,
            action: "UPDATE",
            entityName: "EmployeeDocument",
            entityId: updated.id,
            oldValue: null,
            newValue: JSON.stringify({
              id: updated.id,
              isVerified: updated.isVerified,
              verifiedAt: updated.verifiedAt,
            }),
            ipAddress: null,
            userAgent: null,
          });
        } catch (auditError) {
          console.warn(
            "[WARN] Audit log failed for education document verify",
            auditError,
          );
        }

        return updated;
      }

      throw new Error(`Unsupported document scope: ${scope}`);
    } catch (error: any) {
      console.error("[ERROR] verifyDocument failed", error?.message || error);
      throw error;
    }
  }

  static async unverifyDocument(
    scope: string,
    documentId: number,
    userId: number,
  ) {
    const verifiedAt = null;

    try {
      if (scope === "organization") {
        const updated = await prisma.organizationDocument.update({
          where: { id: documentId },
          data: { isVerified: false, verifiedAt },
        });

        try {
          await createAuditLog(prisma, {
            userId,
            action: "UPDATE",
            entityName: "OrganizationDocument",
            entityId: updated.id,
            oldValue: null,
            newValue: JSON.stringify({
              id: updated.id,
              isVerified: updated.isVerified,
              verifiedAt: updated.verifiedAt,
            }),
            ipAddress: null,
            userAgent: null,
          });
        } catch (auditError) {
          console.warn(
            "[WARN] Audit log failed for organization document unverify",
            auditError,
          );
        }

        return updated;
      }

      if (scope === "employee") {
        const updated = await prisma.employeeDocument.update({
          where: { id: documentId },
          data: { isVerified: false, verifiedAt },
        });

        try {
          await createAuditLog(prisma, {
            userId,
            action: "UPDATE",
            entityName: "EmployeeDocument",
            entityId: updated.id,
            oldValue: null,
            newValue: JSON.stringify({
              id: updated.id,
              isVerified: updated.isVerified,
              verifiedAt: updated.verifiedAt,
            }),
            ipAddress: null,
            userAgent: null,
          });
        } catch (auditError) {
          console.warn(
            "[WARN] Audit log failed for employee document unverify",
            auditError,
          );
        }

        return updated;
      }

      if (scope === "education") {
        const updated = await prisma.employeeDocument.update({
          where: { id: documentId },
          data: { isVerified: false, verifiedAt },
        });

        try {
          await createAuditLog(prisma, {
            userId,
            action: "UPDATE",
            entityName: "EmployeeDocument",
            entityId: updated.id,
            oldValue: null,
            newValue: JSON.stringify({
              id: updated.id,
              isVerified: updated.isVerified,
              verifiedAt: updated.verifiedAt,
            }),
            ipAddress: null,
            userAgent: null,
          });
        } catch (auditError) {
          console.warn(
            "[WARN] Audit log failed for education document unverify",
            auditError,
          );
        }

        return updated;
      }

      throw new Error(`Unsupported document scope: ${scope}`);
    } catch (error: any) {
      console.error("[ERROR] unverifyDocument failed", error?.message || error);
      throw error;
    }
  }

  static async getLatestApplicationByUser(userId: number) {
    const application = await prisma.application.findFirst({
      where: { userId },
      orderBy: { applicationDate: "desc" },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, email: true },
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
            branches: {
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
          },
        },
        inspections: {
          orderBy: [{ scheduledDate: "desc" }, { id: "desc" }],
          include: {
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
        },
      },
    });

    if (!application) throw new Error("Application not found");

    return application;
  }
}
