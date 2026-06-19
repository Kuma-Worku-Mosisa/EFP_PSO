import path from "path";
import fs from "fs";
import {
  ensureOrganizationFolders,
  getRelativeFilePath,
  VALID_ROLES,
  resolveOrganizationUploadDir,
} from "../middleware/fileUpload";

export interface DocumentMapping {
  fieldName: string; // e.g., "manager_education_doc"
  role: string; // e.g., "manager"
  documentType: string; // e.g., "education_doc"
  filePath?: string; // relative path in database
}

/**
 * Parse field name to extract role and document type
 * Format: {role}_{documentType}
 */
export const parseFieldName = (fieldName: string): DocumentMapping | null => {
  const rolePattern = new RegExp(`^(${VALID_ROLES.join("|")})_(.+)$`, "i");
  const match = fieldName.match(rolePattern);

  if (!match) {
    return null;
  }

  return {
    fieldName,
    role: match[1].toLowerCase(),
    documentType: match[2],
  };
};

/**
 * Organize uploaded files into the proper folder structure
 * Called after file upload in multer
 */
export const organizeUploadedFiles = (
  organizationName: string,
  uploadedFiles: Express.Multer.File[],
  staged = false,
): { [key: string]: string } => {
  // Ensure folder structure exists
  ensureOrganizationFolders(organizationName);

  const filePathMap: { [key: string]: string } = {};

  uploadedFiles.forEach((file) => {
    const fieldName = file.fieldname;
    const docMapping = parseFieldName(fieldName);

    if (!docMapping) {
      console.warn(`[WARN] Skipping file: invalid field name ${fieldName}`);
      return;
    }

    const absoluteFilePath = path.isAbsolute(file.path)
      ? file.path
      : path.join(process.cwd(), file.path);

    let relativePath = path.relative(process.cwd(), absoluteFilePath);
    relativePath = relativePath.replace(/\\/g, "/");

    if (!relativePath.startsWith("uploads/")) {
      relativePath = `uploads/${relativePath}`;
    }

    filePathMap[fieldName] = relativePath;

    console.log(
      `[DEBUG] File organized: ${fieldName} -> ${filePathMap[fieldName]}`,
    );
  });

  return filePathMap;
};

/**
 * List all documents for an organization
 */
export const listOrganizationDocuments = (
  organizationName: string,
): { [key: string]: string[] } => {
  const documents: { [key: string]: string[] } = {};
  const uploadDir = resolveOrganizationUploadDir(organizationName);

  if (!fs.existsSync(uploadDir)) {
    return documents;
  }

  VALID_ROLES.forEach((role) => {
    const roleDir = path.join(uploadDir, role);
    if (fs.existsSync(roleDir)) {
      documents[role] = fs.readdirSync(roleDir);
    }
  });

  return documents;
};

/**
 * Get document URL for serving files
 */
export const getDocumentUrl = (relativePath: string): string => {
  // Convert file path to URL format
  return `/${relativePath.replace(/\\/g, "/")}`;
};

/**
 * Delete a document file
 */
export const deleteDocumentFile = (relativePath: string): boolean => {
  const fullPath = path.join(process.cwd(), relativePath);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`[DEBUG] File deleted: ${fullPath}`);
      return true;
    } catch (error) {
      console.error(`[ERROR] Failed to delete file: ${fullPath}`, error);
      return false;
    }
  }

  return false;
};

/**
 * Move a document file from one relative path to another. Ensures destination directory exists.
 */
export const moveDocumentFile = (
  fromRelative: string,
  toRelative: string,
): boolean => {
  try {
    const fromFull = path.join(process.cwd(), fromRelative);
    const toFull = path.join(process.cwd(), toRelative);

    if (!fs.existsSync(fromFull)) {
      console.warn(`[WARN] Source file for move not found: ${fromFull}`);
      return false;
    }

    const toDir = path.dirname(toFull);
    if (!fs.existsSync(toDir)) {
      fs.mkdirSync(toDir, { recursive: true });
    }

    fs.renameSync(fromFull, toFull);
    console.log(`[DEBUG] Moved file from ${fromFull} to ${toFull}`);
    return true;
  } catch (err) {
    console.error(
      `[ERROR] Failed to move file from ${fromRelative} to ${toRelative}`,
      err,
    );
    return false;
  }
};

/**
 * Archive/move documents when application is approved
 */
export const archiveOrganizationDocuments = (
  organizationName: string,
  archiveName: string,
): boolean => {
  const sourceDir = resolveOrganizationUploadDir(organizationName);
  const archiveDir = path.join(process.cwd(), "archives", archiveName);

  if (!fs.existsSync(sourceDir)) {
    console.warn(`[WARN] Source directory not found: ${sourceDir}`);
    return false;
  }

  try {
    // Create archive directory
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    // Copy entire organization folder to archive
    copyDirectoryRecursive(sourceDir, archiveDir);
    console.log(
      `[DEBUG] Documents archived from ${sourceDir} to ${archiveDir}`,
    );
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to archive documents`, error);
    return false;
  }
};

/**
 * Recursive directory copy utility
 */
function copyDirectoryRecursive(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}
