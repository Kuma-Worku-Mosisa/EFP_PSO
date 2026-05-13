// filepath: src/modules/application/application.service.ts
import prisma from "../../lib/prisma";
import {
  ensureOrganizationFolders,
  getRelativeFilePath,
} from "../../middleware/fileUpload";
import {
  parseFieldName,
  getDocumentUrl,
  deleteDocumentFile,
  moveDocumentFile,
} from "../../utils/documentOrganizer";
import { createAuditLog } from "../../utils/auditLogger";

export class ApplicationService {
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
      const personnelKebeles = [
        formData.manager?.kebele,
        formData.ops?.kebele,
        formData.admin?.kebele,
      ].filter(Boolean);

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
      console.log(
        "[DEBUG] Ensuring folder structure for organization:",
        formData.agencyName,
      );
      const orgFolderPath = ensureOrganizationFolders(formData.agencyName);
      console.log(
        "[DEBUG] Organization folder structure ready:",
        orgFolderPath,
      );

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

      const uploadedFileUrls =
        movedFinalPaths.length > 0
          ? movedFinalPaths
          : Object.values(uploadedFiles || {});

      try {
        const result = await prisma.$transaction(async (tx) => {
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
          console.log("[DEBUG] Creating organization:", formData.agencyName);
          const organization = await tx.organization.create({
            data: {
              name: formData.agencyName,
              headOfficeName: formData.headOfficeName,
              branchOfficeName: formData.branchOfficeName || null,
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
              managerName:
                formData.managerName ||
                formData.manager?.fullName ||
                "manager name missing",
              operationHeadName:
                formData.opsHeadName ||
                formData.ops?.fullName ||
                "operations head name missing",
              adminFinanceHeadName:
                formData.adminHeadName ||
                formData.admin?.fullName ||
                "admin head name missing",
              logoUrl: uploadedFiles.logo,
              uniformSampleUrl: uploadedFiles.uniform_sample,
              idCardSampleUrl: uploadedFiles.id_sample,
              status: "Pending",
            },
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
                name: organization.name,
              }),
              ipAddress: null,
              userAgent: null,
            });
          } catch (e) {
            console.warn("[WARN] Audit log failed for organization create", e);
          }

          // 3. Helper Function: Register Personnel (Address -> User -> Employee -> Docs)
          const registerPersonnel = async (personData: any, prefix: string) => {
            if (!personData) {
              console.log(
                `[DEBUG] ${prefix} data is null, skipping registration`,
              );
              return null;
            }

            console.log(`[DEBUG] Registering ${prefix}:`, {
              fullName: personData.fullName,
              email: personData.email,
              faydaId: personData.faydaId,
              kebele: personData.kebele,
            });

            // Validate required fields
            if (
              !personData.fullName ||
              !personData.email ||
              !personData.faydaId ||
              !personData.kebele
            ) {
              throw new Error(
                `${prefix} missing required fields: fullName, email, faydaId, or kebele`,
              );
            }

            // A. Create the Personal Address for the employee
            const personalAddress = await tx.address.create({
              data: {
                kebeleId: Number(personData.kebele),
                houseNumber: personData.houseNo || null,
                specialLocation: personData.specialLocation || null,
              },
            });

            const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);

            // B. Create User Account
            const user = await tx.user.create({
              data: {
                fullName: personData.fullName,
                username: `${prefix}_${uniqueSuffix}`,
                email: personData.email,
                phone: personData.phone,
                password: "hashed_password_placeholder",
                faydaId: personData.faydaId,
              },
            });

            // C. Create Employee Profile linked to Organization and Address
            const employee = await tx.employee.create({
              data: {
                userId: user.id,
                organizationId: organization.id,
                addressId: personalAddress.id, // Linking the created address
                employmentStatus: "PENDING",
                gender: personData.gender,
                citizenship: personData.citizenship,
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
              { key: "collateral_doc", type: "Collateral Document" },
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
          const managerId = await registerPersonnel(
            formData.manager,
            "manager",
          );
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
              // Use the relation name 'application' and 'connect' the ID
              application: {
                connect: { id: application.id },
              },
              trainingBodyName: formData.trainingProvider,
              trainingAddress: formData.trainingAddress,
              trainingStartDate: formData.trainingStartDate
                ? new Date(formData.trainingStartDate)
                : new Date(),
              trainingEndDate: formData.trainingEndDate
                ? new Date(formData.trainingEndDate)
                : new Date(),
              trainingDurationDays: Number(formData.trainingDays),
              trainingManualUrl: uploadedFiles.training_manual,
              trainingCertificateUrl: uploadedFiles.training_cert,
              // FIX: Add default 0 to prevent the NaN error seen in your log
              totalTraineesMale: Number(formData.totalTraineesMale) || 0,
              totalTraineesFemale: Number(formData.totalTraineesFemale) || 0,
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
            }));

          if (orgDocumentEntries.length > 0) {
            await tx.organizationDocument.createMany({
              data: orgDocumentEntries,
            });
          }

          // 8. Log History
          console.log("[DEBUG] Creating application tracking history...");
          await tx.applicationTrackingHistory.create({
            data: {
              applicationId: application.id,
              statusState: "Pending",
              remarks: "Initial application submitted via system.",
              changedBy: userId,
            },
          });

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
        include: { organization: true },
      });

      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      console.log("[DEBUG] Current application status:", application.status);

      // Update application status and organization status atomically
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

        await tx.applicationTrackingHistory.create({
          data: {
            applicationId,
            statusState: "Approved",
            remarks,
            changedBy: userId,
          },
        });

        return updatedApp;
      });

      console.log("[DEBUG] Application approved successfully:", applicationId);
      console.log(
        "[DEBUG] Notifying stakeholders (simulated) for application:",
        applicationId,
      );
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

        await tx.applicationTrackingHistory.create({
          data: {
            applicationId,
            statusState: "Rejected",
            remarks,
            changedBy: userId,
          },
        });

        return updatedApp;
      });

      console.log("[DEBUG] Application rejected:", applicationId);
      console.log(
        "[DEBUG] Notifying applicant (simulated) for application:",
        applicationId,
      );
      return result;
    } catch (error: any) {
      console.error(
        "[ERROR] Reject application failed:",
        error?.message || error,
      );
      throw error;
    }
  }

  static async listApplications() {
    try {
      const rows = await prisma.application.findMany({
        orderBy: { applicationDate: "desc" },
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
              educationDocs: true,
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
              educationDocs: true,
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
              educationDocs: true,
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
          history: {
            orderBy: { changedAt: "desc" },
          },
        },
      });

      const toFileList = (
        docs: Array<{ documentType?: string; fileUrl?: string }>,
      ) =>
        (docs || []).map((doc) => ({
          documentType: doc.documentType,
          fileUrl: doc.fileUrl,
          fileName: doc.fileUrl
            ? doc.fileUrl.split("/").pop() || doc.fileUrl
            : doc.documentType,
        }));

      const serializeEmployee = (employee: any) => {
        if (!employee) return null;

        return {
          id: employee.id,
          user: employee.user,
          gender: employee.gender,
          citizenship: employee.citizenship,
          address: employee.address,
          educationDocs: toFileList(employee.educationDocs || []),
          documents: toFileList(employee.documents || []),
        };
      };

      return rows.map((r) => {
        const organization = r.organization as any;
        const latestTraining = r.trainingDetails?.[0] as any;

        return {
          id: r.id,
          agency: organization?.name || "",
          type: r.type,
          date: r.applicationDate
            ? r.applicationDate.toISOString().split("T")[0]
            : null,
          status: r.status,
          organization: organization
            ? {
                id: organization.id,
                name: organization.name,
                headOfficeName: organization.headOfficeName,
                branchOfficeName: organization.branchOfficeName,
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
                logoUrl: organization.logoUrl,
                uniformSampleUrl: organization.uniformSampleUrl,
                idCardSampleUrl: organization.idCardSampleUrl,
                address: organization.address
                  ? {
                      houseNumber: organization.address.houseNumber,
                      specialLocation: organization.address.specialLocation,
                      kebele: organization.address.kebele
                        ? {
                            name: organization.address.kebele.name,
                            woreda: organization.address.kebele.woreda
                              ? {
                                  name: organization.address.kebele.woreda.name,
                                  zone: organization.address.kebele.woreda.zone
                                    ? {
                                        name: organization.address.kebele.woreda
                                          .zone.name,
                                        region: organization.address.kebele
                                          .woreda.zone.region
                                          ? {
                                              name: organization.address.kebele
                                                .woreda.zone.region.name,
                                            }
                                          : null,
                                      }
                                    : null,
                                }
                              : null,
                          }
                        : null,
                    }
                  : null,
                documents: toFileList(organization.documents || []),
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
                trainingManualUrl: latestTraining.trainingManualUrl,
                trainingCertificateUrl: latestTraining.trainingCertificateUrl,
                totalTraineesMale: latestTraining.totalTraineesMale,
                totalTraineesFemale: latestTraining.totalTraineesFemale,
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
}
