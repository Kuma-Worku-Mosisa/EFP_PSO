//filepath: backend/src/middleware/fileUpload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

// Define the base upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");
const SECURE_DOCUMENTS_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, "secure-documents");
const ALLOWED_DOCUMENT_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);
const ALLOWED_DOCUMENT_MIME_TYPES = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export const sanitizeDocumentTypePrefix = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const withoutNullBytes = trimmedValue.replace(/\0/g, "");
  const withoutTraversal = withoutNullBytes.replace(/\.\.(?:[\\/]+|$)/g, "");
  const sanitized = withoutTraversal.replace(/[^a-zA-Z0-9-]/g, "");

  if (
    !sanitized ||
    sanitized.length > 64 ||
    sanitized !== withoutTraversal ||
    /[\\/]/.test(withoutTraversal) ||
    /\.\./.test(withoutTraversal)
  ) {
    return null;
  }

  return sanitized.toLowerCase();
};

export const buildSecureDocumentFilename = (
  documentType: string,
  file: Express.Multer.File,
): string => {
  const prefix = sanitizeDocumentTypePrefix(documentType);
  if (!prefix) {
    throw new Error(
      "Invalid documentType. Use only letters, numbers, and hyphens.",
    );
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const normalizedExtension = extension.replace(/^\./, "");

  if (!ALLOWED_DOCUMENT_EXTENSIONS.has(normalizedExtension)) {
    throw new Error(`Unsupported document extension: ${normalizedExtension}`);
  }

  return `${prefix}_${crypto.randomUUID()}${extension}`;
};

export const createSecureDocumentUploadMiddleware = (
  fieldName = "document",
  destinationDir = SECURE_DOCUMENTS_UPLOAD_DIR,
) => {
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      try {
        const documentType = req.body?.documentType;
        cb(null, buildSecureDocumentFilename(documentType, file));
      } catch (error) {
        cb(
          error instanceof Error
            ? error
            : new Error("Upload filename creation failed"),
          "",
        );
      }
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      const documentType = sanitizeDocumentTypePrefix(req.body?.documentType);
      if (!documentType) {
        return cb(
          new Error(
            "Invalid documentType. Use only letters, numbers, and hyphens.",
          ),
        );
      }

      const extension = path
        .extname(file.originalname || "")
        .toLowerCase()
        .replace(/^\./, "");
      const mimeType = file.mimetype?.toLowerCase();

      const allowedMime = ALLOWED_DOCUMENT_MIME_TYPES.get(mimeType || "");
      const isAllowedExtension = ALLOWED_DOCUMENT_EXTENSIONS.has(extension);
      const isAllowedMime = Boolean(allowedMime && allowedMime === extension);

      if (!isAllowedExtension || !isAllowedMime) {
        return cb(
          new Error(
            `Unsupported file type. Allowed types: ${Array.from(ALLOWED_DOCUMENT_EXTENSIONS).join(", ")}`,
          ),
        );
      }

      cb(null, true);
    },
  });

  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (error: unknown) => {
      if (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Document upload failed";

        if (message.includes("too large")) {
          return next(new Error("File exceeds the 10MB upload limit"));
        }

        return next(new Error(message));
      }

      next();
    });
  };
};

export const secureDocumentUpload = createSecureDocumentUploadMiddleware();

// Define the base upload directory
const ORGANIZATION_ROOT_FOLDER = "organization";

// Ensure base upload directory exists
if (!fs.existsSync(UPLOAD_BASE_DIR)) {
  fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
}

// Valid roles for document organization
export const VALID_ROLES = [
  "organization",
  "manager",
  "operations",
  "administrator",
  "security_guard",
];

const TRANSFER_DOCUMENT_ROLE_SUFFIXES = [
  "fingerprint_doc",
  "medical_doc",
  "guarantee_doc",
  "resignation_record_doc",
];

const sanitizeFilenamePrefix = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/^organization_/, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase() || "file";

export const sanitizeFolderSegment = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\\/?:*"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/_+/g, "_")
    .trim() || "unknown";

export const resolveOrganizationFolderName = (organizationName: string) => {
  const trimmed = String(organizationName || "").trim();
  const withoutUploadsPrefix = trimmed.replace(/^uploads[\\/]+/i, "");
  const parts = withoutUploadsPrefix
    .split(/[\\/]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts[0]?.toLowerCase() === ORGANIZATION_ROOT_FOLDER) {
    parts.shift();
  }

  return sanitizeFolderSegment(parts.join(" ") || withoutUploadsPrefix);
};

export const resolveOrganizationUploadDir = (organizationName: string) =>
  path.join(
    UPLOAD_BASE_DIR,
    ORGANIZATION_ROOT_FOLDER,
    resolveOrganizationFolderName(organizationName),
  );

export const resolveCustomDocumentFolderSegments = (folderPath: string) => {
  const trimmed = String(folderPath || "").trim();
  if (!trimmed) return [];

  const withoutUploadsPrefix = trimmed.replace(/^uploads[\\/]+/i, "");
  return withoutUploadsPrefix
    .split(/[\\/]+/)
    .map((segment) => sanitizeFolderSegment(segment))
    .filter(Boolean);
};

export const buildPrefixedFilename = (
  prefix: string,
  originalName: string,
): string => {
  const timestamp = Date.now();
  const uniqueSuffix = crypto.randomUUID().replace(/-/g, "");
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();
  const sanitizedPrefix = sanitizeFilenamePrefix(prefix);

  return `${sanitizedPrefix}-${timestamp}-${uniqueSuffix}-${sanitizedName}`;
};

/**
 * Creates the folder structure for an organization
 * uploads/{organizationName}/{role}/
 */
export const ensureOrganizationFolders = (organizationName: string) => {
  const orgDir = resolveOrganizationUploadDir(organizationName);

  // Create organization root folder
  if (!fs.existsSync(orgDir)) {
    fs.mkdirSync(orgDir, { recursive: true });
  }

  // Create role subfolders
  VALID_ROLES.forEach((role) => {
    const roleDir = path.join(orgDir, role);
    if (!fs.existsSync(roleDir)) {
      fs.mkdirSync(roleDir, { recursive: true });
    }
  });

  return orgDir;
};

/**
 * Custom storage configuration for Multer
 * Stores files in: uploads/{organizationName}/{role}/{timestamp}-{filename}
 */
export const createMulterStorage = (organizationName: string, role: string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Validate role
      if (!VALID_ROLES.includes(role)) {
        return cb(new Error(`Invalid role: ${role}`), "");
      }

      const uploadDir = path.join(
        resolveOrganizationUploadDir(organizationName),
        role,
      );

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename(file.fieldname, file.originalname));
    },
  });

  return storage;
};

/**
 * File filter: accept only specific document types
 */
export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Allowed MIME types
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed: PDF, images, Word, Excel`,
      ),
    );
  }
};

/**
 * Create multer instance for organization document uploads
 */
export const createOrgDocumentUploader = (
  organizationName: string,
  role: string,
) => {
  const storage = createMulterStorage(organizationName, role);

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  });
};

/**
 * Create multer instance for mixed organization uploads.
 * Field names must start with a valid role prefix, e.g. organization_logo,
 * manager_fingerprint_doc, operations_medical_doc.
 */
export const buildEmployeeFilename = (originalName: string) => {
  const timestamp = Date.now();
  const uniqueSuffix = crypto.randomUUID().replace(/-/g, "");
  const sanitizedName =
    String(originalName)
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase() || "file";

  return `${timestamp}-${uniqueSuffix}-${sanitizedName}`;
};

export const createOrganizationDocumentsUploader = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const organizationName = String(req.body?.organizationName || "").trim();

      if (!organizationName) {
        return cb(new Error("organizationName is required in form data"), "");
      }

      const fieldName = String(file.fieldname || "");
      const roleMatch = fieldName.match(
        new RegExp(`^(${VALID_ROLES.join("|")})_`, "i"),
      );
      const role = roleMatch ? roleMatch[1].toLowerCase() : "";
      const isTransferDocumentRole = TRANSFER_DOCUMENT_ROLE_SUFFIXES.some(
        (suffix) => fieldName.toLowerCase().endsWith(`_${suffix}`) || fieldName.toLowerCase() === suffix,
      );

      if (!VALID_ROLES.includes(role) && !isTransferDocumentRole) {
        return cb(
          new Error(`Invalid document role: ${role || file.fieldname}`),
          "",
        );
      }

      const employeePositionName = String(
        req.body?.employeePositionName || req.body?.positionName || "",
      ).trim();
      const employeeFullName = String(
        req.body?.employeeFullName || req.body?.fullName || "",
      ).trim();
      const documentFolderPath = String(
        req.body?.documentFolderPath || req.body?.folderPath || "",
      ).trim();

      let uploadDir = path.join(
        resolveOrganizationUploadDir(organizationName),
        role,
      );

      if (employeePositionName) {
        uploadDir = path.join(
          uploadDir,
          sanitizeFolderSegment(employeePositionName),
        );
      }

      if (employeeFullName) {
        uploadDir = path.join(
          uploadDir,
          sanitizeFolderSegment(employeeFullName),
        );
      }

      const customFolderSegments =
        resolveCustomDocumentFolderSegments(documentFolderPath);
      customFolderSegments.forEach((segment) => {
        uploadDir = path.join(uploadDir, segment);
      });

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const employeeFullName = String(
        req.body?.employeeFullName || req.body?.fullName || "",
      ).trim();

      // Always prefix the stored filename with the document field name (document type)
      // This ensures files like `operations_resignation_record_doc-...-original.pdf`
      // even when employeeFullName is provided and used for folder segmentation.
      try {
        const prefix = String(file.fieldname || "file");
        cb(null, buildPrefixedFilename(prefix, file.originalname));
      } catch (err) {
        // Fallback to a generic unique filename
        cb(null, buildEmployeeFilename(file.originalname));
      }
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
};

/**
 * Get relative file path for database storage
 */
export const getRelativeFilePath = (
  organizationName: string,
  role: string,
  filename: string,
): string => {
  return `uploads/${ORGANIZATION_ROOT_FOLDER}/${resolveOrganizationFolderName(
    organizationName,
  )}/${role}/${filename}`;
};

/**
 * Get relative file path for temporary staging
 */
export const getRelativeTempFilePath = (
  organizationName: string,
  role: string,
  filename: string,
): string => {
  return `uploads/_tmp/${ORGANIZATION_ROOT_FOLDER}/${resolveOrganizationFolderName(
    organizationName,
  )}/${role}/${filename}`;
};

/**
 * Get full file path from database path
 */
export const getFullFilePath = (relativePath: string): string => {
  return path.join(process.cwd(), relativePath);
};
