import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import {
  organizeUploadedFiles,
  getDocumentUrl,
} from "../../utils/documentOrganizer";
import { ensureOrganizationFolders } from "../../middleware/fileUpload";

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

    // Organize files into staging structure (they are uploaded into uploads/_tmp/... by multer)
    const filePathMap = organizeUploadedFiles(
      organizationName,
      req.files as Express.Multer.File[],
      true,
    );

    // Convert relative paths to URLs for frontend
    const fileUrlMap: { [key: string]: string } = {};
    Object.entries(filePathMap).forEach(([key, path]) => {
      fileUrlMap[key] = getDocumentUrl(path);
    });

    console.log(
      `[DEBUG] Successfully organized ${Object.keys(filePathMap).length} files`,
    );

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
