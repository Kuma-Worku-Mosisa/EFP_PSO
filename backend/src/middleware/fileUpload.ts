import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Define the base upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");
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
  const sanitizedName =
    String(originalName)
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase() || "file";

  return `${timestamp}-${sanitizedName}`;
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

      if (!VALID_ROLES.includes(role)) {
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

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const employeeFullName = String(
        req.body?.employeeFullName || req.body?.fullName || "",
      ).trim();

      if (employeeFullName) {
        cb(null, buildEmployeeFilename(file.originalname));
        return;
      }

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
