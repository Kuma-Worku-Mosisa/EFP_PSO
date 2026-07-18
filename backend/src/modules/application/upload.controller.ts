import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import {
  organizeUploadedFiles,
  getDocumentUrl,
  parseFieldName,
  normalizeDocumentType,
  isDocumentTypeMatch,
} from "../../utils/documentOrganizer";
import prisma from "../../lib/prisma";

/**
 * Handle file uploads for organization documents
 * Expected request format:
 * - organizationName: string
 * - Files: multipart with field names like {role}_{documentType}
 *   Example: manager_education_doc, operations_medical_doc, etc.
 */
export const uploadDocuments = async (req: Request, res: Response) => {
  try {
    const { organizationName } = req.body;

    // Validate required fields
    if (!organizationName) {
      return ApiResponse.error(res, "Organization name is required", 400);
    }

    // Check if files were uploaded
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return ApiResponse.error(res, "No files were uploaded", 400);
    }

    console.log(
      `[DEBUG] Upload initiated for organization: ${organizationName}`,
    );
    console.log(
      `[DEBUG] Number of files: ${(req.files as Express.Multer.File[]).length}`,
    );

    // Organize files into final folder structure (files are uploaded directly into uploads/{org}/{role})
    const filePathMap = organizeUploadedFiles(
      organizationName,
      req.files as Express.Multer.File[],
      false,
    );

    // Convert relative paths to URLs for frontend
    const fileUrlMap: { [key: string]: string } = {};
    Object.entries(filePathMap).forEach(([key, path]) => {
      fileUrlMap[key] = getDocumentUrl(path);
    });

    const employeeId = Number(req.body.employeeId ?? 0);
    if (employeeId > 0) {
      const employeeExists = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true },
      });

      if (!employeeExists) {
        return ApiResponse.error(
          res,
          "Employee not found for provided employeeId",
          400,
        );
      }

      const documentUpdates = Object.entries(fileUrlMap)
        .map(([fieldName, fileUrl]) => {
          const mapping = parseFieldName(fieldName);
          if (!mapping) {
            return null;
          }
          return {
            documentType: normalizeDocumentType(mapping.documentType),
            fileUrl,
          };
        })
        .filter(Boolean) as Array<{ documentType: string; fileUrl: string }>;

      if (documentUpdates.length > 0) {
        await prisma.$transaction(async (tx) => {
          for (const { documentType, fileUrl } of documentUpdates) {
            console.log(
              `[DEBUG] Persisting document for employee=${employeeId} type=${documentType} url=${fileUrl}`,
            );

            const existingDocuments = await tx.employeeDocument.findMany({
              where: { employeeId },
            });
            const matchingExistingDocuments = existingDocuments.filter(
              (existingDocument) =>
                isDocumentTypeMatch(
                  existingDocument.documentType,
                  documentType,
                ),
            );

            if (matchingExistingDocuments.length > 0) {
              for (const existingDocument of matchingExistingDocuments) {
                const updated = await tx.employeeDocument.update({
                  where: { id: existingDocument.id },
                  data: {
                    documentType,
                    fileUrl,
                    uploadedAt: new Date(),
                    isVerified: false,
                    verifiedAt: null,
                  },
                });
                console.log(
                  `[DEBUG] Updated EmployeeDocument id=${updated.id} employee=${updated.employeeId} type=${updated.documentType}`,
                );
              }
            } else {
              const created = await tx.employeeDocument.create({
                data: {
                  employeeId,
                  documentType,
                  fileUrl,
                },
              });
              console.log(
                `[DEBUG] Created EmployeeDocument id=${created.id} employee=${created.employeeId} type=${created.documentType}`,
              );
            }
          }
        });
      }
    }

    return ApiResponse.success(
      res,
      "Files uploaded and organized successfully",
      {
        uploadedFiles: fileUrlMap,
        totalFiles: Object.keys(fileUrlMap).length,
      },
      201,
    );
  } catch (error: any) {
    console.error("[ERROR] File upload failed:", error);
    return ApiResponse.error(res, "File upload failed", 500, error?.message);
  }
};

/**
 * Get list of uploaded documents for an organization
 */
export const getOrganizationDocuments = async (req: Request, res: Response) => {
  try {
    const { organizationName } = req.params;

    if (!organizationName) {
      return ApiResponse.error(res, "Organization name is required", 400);
    }

    // Implementation would use listOrganizationDocuments from documentOrganizer
    // For now, return success
    return ApiResponse.success(res, "Documents retrieved", {
      organizationName,
    });
  } catch (error: any) {
    console.error("[ERROR] Failed to get documents:", error);
    return ApiResponse.error(
      res,
      "Failed to retrieve documents",
      500,
      error?.message,
    );
  }
};
