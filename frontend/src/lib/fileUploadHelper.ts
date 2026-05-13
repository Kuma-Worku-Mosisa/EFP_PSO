import { API_BASE } from "./api";

/**
 * File Upload Helper for Application Documents
 * Handles uploading files organized by organization and role
 */

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    uploadedFiles: Record<string, string>;
    totalFiles: number;
  };
  error?: string;
}

async function safeReadResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!bodyText) return null;

  if (contentType.includes("application/json")) {
    return JSON.parse(bodyText);
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return { message: bodyText };
  }
}

/**
 * Upload documents for an organization
 * Files should be organized by role: {role}_{documentType}
 *
 * Example usage:
 * const files = new Map([
 *   ['manager_education_doc', fileObject1],
 *   ['manager_medical_doc', fileObject2],
 *   ['operations_education_doc', fileObject3],
 * ]);
 *
 * const result = await uploadOrganizationDocuments('My Agency', files);
 */
export async function uploadOrganizationDocuments(
  organizationName: string,
  filesMap: Map<string, File> | Record<string, File>,
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("organizationName", organizationName);

    // Add files to FormData
    if (filesMap instanceof Map) {
      filesMap.forEach((file, fieldName) => {
        if (file) {
          formData.append(fieldName, file);
        }
      });
    } else {
      Object.entries(filesMap).forEach(([fieldName, file]) => {
        if (file) {
          formData.append(fieldName, file);
        }
      });
    }

    const response = await fetch(`${API_BASE}/applications/upload`, {
      method: "POST",
      body: formData,
      // Note: Do NOT set Content-Type header when using FormData
      // Browser will automatically set it with correct boundary
    });

    const result = await safeReadResponse(response);

    if (!response.ok) {
      const errorMessage =
        result?.error ||
        result?.message ||
        `Upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("[ERROR] File upload failed:", error);
    return {
      success: false,
      message: "File upload failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File "${file.name}" is too large. Max size is 10MB.`,
    };
  }

  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed: PDF, images, Word, Excel.`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get document type display name
 */
export function getDocumentTypeName(fieldName: string): string {
  const documentNames: Record<string, string> = {
    education_doc: "Education Certificate",
    id_passport_or_kabele_doc: "National ID/Passport/Kebele",
    fingerprint_doc: "Fingerprint",
    medical_doc: "Medical Certificate",
    training_doc: "Training Certificate",
    support_doc: "Supporting Document",
    collateral_doc: "Collateral Document",
    experience_doc: "Experience Certificate",
    resignation_letter_doc: "Resignation Letter",
    organization_Id_doc: "Organization ID Document",
    logo: "Organization Logo",
    uniform_sample: "Uniform Sample",
    id_sample: "ID Card Sample",
    training_manual: "Training Manual",
    training_cert: "Training Certificate",
  };

  // Try exact match first
  if (documentNames[fieldName]) {
    return documentNames[fieldName];
  }

  // Try matching the suffix after the last underscore
  const parts = fieldName.split("_");
  const suffix = parts.slice(1).join("_");
  if (documentNames[suffix]) {
    return documentNames[suffix];
  }

  // Fallback: format the field name
  return fieldName
    .replace(/_/g, " ")
    .replace(/doc/i, "")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
