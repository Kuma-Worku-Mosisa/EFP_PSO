import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Define the base upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");

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

const sanitizeFilenamePrefix = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/^organization_/, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase() || "file";

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
  const orgDir = path.join(UPLOAD_BASE_DIR, organizationName);

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
        return cb(new Error(`Invalid role: ${role}`));
      }

      const uploadDir = path.join(UPLOAD_BASE_DIR, organizationName, role);

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
export const createOrganizationDocumentsUploader = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const organizationName = String(req.body?.organizationName || "").trim();

      if (!organizationName) {
        return cb(new Error("organizationName is required in form data"));
      }

      const role = String(file.fieldname || "")
        .split("_")[0]
        .toLowerCase();

      if (!VALID_ROLES.includes(role)) {
        return cb(
          new Error(`Invalid document role: ${role || file.fieldname}`),
        );
      }

      // Store uploads directly in the final organization folder to save space
      // and avoid double-moving files. Path: uploads/{organizationName}/{role}
      const uploadDir = path.join(UPLOAD_BASE_DIR, organizationName, role);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename(file.fieldname, file.originalname));
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
  return `uploads/${organizationName}/${role}/${filename}`;
};

/**
 * Get relative file path for temporary staging
 */
export const getRelativeTempFilePath = (
  organizationName: string,
  role: string,
  filename: string,
): string => {
  return `uploads/_tmp/${organizationName}/${role}/${filename}`;
};

/**
 * Get full file path from database path
 */
export const getFullFilePath = (relativePath: string): string => {
  return path.join(process.cwd(), relativePath);
};
