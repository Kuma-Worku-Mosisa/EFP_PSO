//filepath: backend/src/modules/employee/employee.service.ts
import prisma from "../../lib/prisma";
import * as bcrypt from "bcryptjs";
import { createAuditLog } from "../../utils/auditLogger";
import {
  getDocumentUrl,
  moveDocumentFile,
} from "../../utils/documentOrganizer";
import { sanitizeFolderSegment } from "../../middleware/fileUpload";
import fs from "fs";
import path from "path";

export class ServiceError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export type EmployeeRegistrationInput = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  faydaId: string;
  positionId?: number | null;
  educationLevel?: string | null;
  workExpYears?: number | null;
  TotalExpYears?: number | null;
  gender?: string | null;
  citizenship?: string | null;
  age?: number | null;
  employmentStatus?: string | null;
  startedDate?: string | null; // ISO 8601 date format
  organizationId: number;
  kebeleId: number;
  houseNo?: string | null;
  specialLocation?: string | null;
  uploadedFiles?: Record<string, string>;
};

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

const sanitizePersonFolderName = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\\/?:*"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .trim() || "unknown";

/**
 * Move all employee files (all roles) to per-person, per-position folder structure:
 * uploads/organization/{org}/{role}/{positionName}/{userId}-{fullName}/{filename}
 */
const moveEmployeeFilesToPersonFolder = (
  uploadedFiles: Record<string, string>,
  userId: number,
  fullName: string,
  positionName?: string | null,
): Array<{ from: string; to: string }> => {
  const userFolder = `${userId}-${sanitizePersonFolderName(fullName)}`;
  const positionFolder = positionName
    ? sanitizeFolderSegment(String(positionName))
    : null;
  const movedFiles: Array<{ from: string; to: string }> = [];

  // Track source dirs that may need cleanup (plain full-name folders created during upload)
  const candidateSourceDirs = new Set<string>();
  const processedSourcePaths = new Map<string, string>();

  // Valid role prefixes that will be moved
  const validRoles = [
    "organization",
    "manager",
    "operations",
    "administrator",
    "security_guard",
  ];

  for (const [fieldName, fileUrl] of Object.entries(uploadedFiles)) {
    if (!fileUrl) {
      continue;
    }

    // Find which role prefix this file has
    const rolePrefix = validRoles.find(
      (role) => fieldName.startsWith(`${role}_`) && fieldName !== role,
    );
    if (!rolePrefix) {
      continue;
    }

    const relativePath = String(fileUrl).replace(/^\/+/, "");
    const normalized = relativePath.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const roleIndex = parts.findIndex((part) => part === rolePrefix);
    const unprefixedFieldName = fieldName.slice(rolePrefix.length + 1);

    if (processedSourcePaths.has(relativePath)) {
      const existingTargetPath = processedSourcePaths.get(relativePath)!;
      const existingUrl = getDocumentUrl(existingTargetPath);
      uploadedFiles[fieldName] = existingUrl;
      if (uploadedFiles[unprefixedFieldName]) {
        uploadedFiles[unprefixedFieldName] = existingUrl;
      }
      continue;
    }

    const expectedAfterRole = positionFolder
      ? [positionFolder, userFolder]
      : [userFolder];
    const actualAfterRole = parts.slice(
      roleIndex + 1,
      roleIndex + 1 + expectedAfterRole.length,
    );

    if (
      actualAfterRole.length === expectedAfterRole.length &&
      actualAfterRole.every((part, index) => part === expectedAfterRole[index])
    ) {
      // File already inside the expected per-person folder. Ensure filename is prefixed
      const existingFilename = parts[parts.length - 1];
      const unprefixedFieldNamePreview = String(fieldName).startsWith(
        `${rolePrefix}_`,
      )
        ? fieldName.slice(rolePrefix.length + 1)
        : fieldName;
      const docPrefixPreview = unprefixedFieldNamePreview.replace(
        /[^a-zA-Z0-9\-_.]/g,
        "_",
      );
      if (!existingFilename.startsWith(`${docPrefixPreview}-`)) {
        const basePartsExisting = parts.slice(0, roleIndex + 1);
        const targetPartsExisting = positionFolder
          ? [
              ...basePartsExisting,
              positionFolder,
              userFolder,
              `${docPrefixPreview}-${existingFilename}`,
            ]
          : [
              ...basePartsExisting,
              userFolder,
              `${docPrefixPreview}-${existingFilename}`,
            ];
        const targetRelExisting = targetPartsExisting.join("/");
        const movedExisting = moveDocumentFile(relativePath, targetRelExisting);
        if (!movedExisting) {
          // rollback
          movedFiles.forEach(({ from, to }) => moveDocumentFile(to, from));
          throw new Error(
            `Failed to rename employee file inside personal folder: ${relativePath}`,
          );
        }
        const newUrlExisting = getDocumentUrl(targetRelExisting);
        uploadedFiles[fieldName] = newUrlExisting;
        const unprefName = fieldName.startsWith(`${rolePrefix}_`)
          ? fieldName.slice(rolePrefix.length + 1)
          : fieldName;
        if (uploadedFiles[unprefName])
          uploadedFiles[unprefName] = newUrlExisting;
        movedFiles.push({ from: relativePath, to: targetRelExisting });
      }
      continue;
    }

    let filename = parts[parts.length - 1];

    // Strip the role prefix from the filename when present
    const prefixWithUnderscore = `${rolePrefix}_`;
    if (filename.startsWith(prefixWithUnderscore)) {
      filename = filename.slice(prefixWithUnderscore.length);
    }

    // Prefix filename with document key to identify files under user folder
    const docPrefix = unprefixedFieldName.replace(/[^a-zA-Z0-9\-_.]/g, "_");
    const prefixedFilename = filename.startsWith(`${docPrefix}-`)
      ? filename
      : `${docPrefix}-${filename}`;

    const baseParts = parts.slice(0, roleIndex + 1);
    const targetParts = positionFolder
      ? [...baseParts, positionFolder, userFolder, prefixedFilename]
      : [...baseParts, userFolder, prefixedFilename];

    const targetRelativePath = targetParts.join("/");

    const moved = moveDocumentFile(relativePath, targetRelativePath);
    if (!moved) {
      // Roll back any moves already performed
      movedFiles.forEach(({ from, to }) => {
        moveDocumentFile(to, from);
      });
      throw new Error(
        `Failed to move employee file to personal folder: ${relativePath}`,
      );
    }

    const newUrl = getDocumentUrl(targetRelativePath);
    uploadedFiles[fieldName] = newUrl;

    // Also update the unprefixed document key when present so the
    // employee document mapping uses the final file location.
    if (uploadedFiles[unprefixedFieldName]) {
      uploadedFiles[unprefixedFieldName] = newUrl;
    }

    movedFiles.push({ from: relativePath, to: targetRelativePath });
    processedSourcePaths.set(relativePath, targetRelativePath);

    // If the source path included the plain fullName folder (not userId-prefixed), mark it for cleanup
    const sourceParent = parts.slice(0, parts.length - 1);
    const lastSegment = sourceParent[sourceParent.length - 1];
    if (lastSegment === sanitizeFolderSegment(fullName)) {
      candidateSourceDirs.add(sourceParent.join("/"));
    }
  }

  // Attempt to remove any empty pre-user fullName folders that we moved files out of
  for (const dir of candidateSourceDirs) {
    try {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const entries = fs.readdirSync(fullPath);
        if (entries.length === 0) {
          fs.rmdirSync(fullPath);
          console.log(`[DEBUG] Removed empty source folder: ${fullPath}`);
        }
      }
    } catch (err) {
      console.warn(`[WARN] Could not remove source folder ${dir}:`, err);
    }
  }

  return movedFiles;
};

export const updateEmployeeEmploymentStatus = async (
  employeeId: number,
  newStatus: string,
  actorUserId: number | null,
) => {
  const normalizedStatus = String(newStatus || "").trim();
  const allowedStatuses = new Set(["Resigned", "Terminated"]);

  if (!normalizedStatus || !allowedStatuses.has(normalizedStatus)) {
    throw new ServiceError(
      "Employee status must be either Resigned or Terminated",
      "INVALID_EMPLOYEE_STATUS",
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });

  if (!employee) {
    throw new ServiceError("Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  const currentStatus = String(employee.employmentStatus || "").trim();
  const currentNormalized = currentStatus.toLowerCase();
  const requestedNormalized = normalizedStatus.toLowerCase();

  if (!["active", "terminated"].includes(currentNormalized)) {
    throw new ServiceError(
      "Only active or terminated employees can be updated to Resigned or Terminated",
      "INVALID_EMPLOYEE_STATUS_TRANSITION",
    );
  }

  if (currentNormalized === requestedNormalized) {
    return employee;
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      employmentStatus: normalizedStatus,
    },
  });

  await createAuditLog(prisma, {
    userId: actorUserId,
    action: "UPDATE",
    entityName: "Employee",
    entityId: employeeId,
    oldValue: JSON.stringify(employee),
    newValue: JSON.stringify(updatedEmployee),
    ipAddress: null,
    userAgent: null,
  });

  return updatedEmployee;
};

export const updateEmployeeBlacklistStatus = async (
  employeeId: number,
  isBlacklisted: boolean,
  actorUserId: number | null,
) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new ServiceError("Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  const nextValue = Boolean(isBlacklisted);
  if (employee.isBlacklisted === nextValue) {
    return employee;
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      isBlacklisted: nextValue,
    },
  });

  await createAuditLog(prisma, {
    userId: actorUserId,
    action: "UPDATE",
    entityName: "Employee",
    entityId: employeeId,
    oldValue: JSON.stringify(employee),
    newValue: JSON.stringify(updatedEmployee),
    ipAddress: null,
    userAgent: null,
  });

  return updatedEmployee;
};

export const registerEmployee = async (
  input: EmployeeRegistrationInput,
  actorUserId: number | null,
) => {
  const movedSecurityFiles: Array<{ from: string; to: string }> = [];

  const rollbackMovedSecurityFiles = () => {
    for (const move of movedSecurityFiles.slice().reverse()) {
      try {
        moveDocumentFile(move.to, move.from);
      } catch (rollbackError) {
        console.error(
          "[ERROR] Failed to rollback security guard file move:",
          rollbackError,
        );
      }
    }
  };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            { username: input.username },
            { email: input.email },
            { phone: input.phone },
            { faydaId: input.faydaId },
          ],
        },
      });

      if (existingUser) {
        const conflictField =
          existingUser.username === input.username
            ? "username"
            : existingUser.email === input.email
              ? "email"
              : existingUser.phone === input.phone
                ? "phone"
                : existingUser.faydaId === input.faydaId
                  ? "faydaId"
                  : "user";
        throw new ServiceError(
          `Duplicate ${conflictField} already exists`,
          `DUPLICATE_${conflictField.toUpperCase()}`,
        );
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const employeeAddress = await tx.address.create({
        data: {
          kebeleId: Number(input.kebeleId),
          houseNumber: input.houseNo || null,
          specialLocation: input.specialLocation || null,
        },
      });

      const createdUser = await tx.user.create({
        data: {
          username: input.username,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
          faydaId: input.faydaId,
          status: "ACTIVE",
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: createdUser.id,
          organizationId: input.organizationId,
          addressId: employeeAddress.id,
          positionId: normalizeOptionalNumber(input.positionId),
          educationLevel: normalizeOptionalText(input.educationLevel),
          workExpYears: normalizeOptionalNumber(input.workExpYears) ?? 0,
          TotalExpYears: normalizeOptionalNumber(input.TotalExpYears) ?? 0,
          gender: input.gender || null,
          citizenship: input.citizenship || null,
          age: normalizeOptionalNumber(input.age),
          employmentStartDate: input.startedDate
            ? new Date(input.startedDate)
            : null,
          employmentStatus:
            normalizeOptionalText(input.employmentStatus) || "ACTIVE",
        },
      });

      // Resolve position name (if provided) so we can create a position folder
      let positionName: string | null = null;
      const normalizedPositionId = normalizeOptionalNumber(input.positionId);
      if (normalizedPositionId) {
        const pos = await tx.position.findUnique({
          where: { id: normalizedPositionId },
        });
        positionName = pos?.name ?? null;
      }

      // Move all employee files BEFORE building employeeDocs so the URLs stored
      // in the database reflect the final post-move file locations.
      const moved = moveEmployeeFilesToPersonFolder(
        input.uploadedFiles || {},
        createdUser.id,
        input.fullName,
        positionName,
      );
      movedSecurityFiles.push(...moved);

      const documentTypes = [
        { key: "education", type: "Education Certificate" },
        { key: "national_id", type: "National ID" },
        { key: "fingerprint", type: "Fingerprint" },
        { key: "medical", type: "Medical Result" },
        { key: "training", type: "Training Certificate" },
        { key: "support_letter", type: "Support Letter" },
        { key: "guarantee", type: "Proof of Guarantee" },
        { key: "experience", type: "Work Experience" },
        { key: "resignation", type: "Resignation Record" },
        { key: "kebele_or_passport", type: "Kebele or Passport Document" },
        { key: "organizational_id", type: "Organizational Identification" },
      ];

      const normalizeDocumentKey = (fieldName: string) => {
        const aliases: Record<string, string> = {
          work_exp: "experience",
          passport_kebele: "kebele_or_passport",
          org_id: "organizational_id",
        };
        return aliases[fieldName] || fieldName;
      };

      const employeeDocs = Object.entries(input.uploadedFiles || {})
        .map(([fieldName, fileUrl]) => {
          const normalizedKey = normalizeDocumentKey(fieldName);
          const mapping = documentTypes.find(
            (doc) => doc.key === normalizedKey,
          );
          return mapping
            ? {
                employeeId: employee.id,
                documentType: mapping.type,
                fileUrl,
              }
            : null;
        })
        .filter(
          (
            entry,
          ): entry is {
            employeeId: number;
            documentType: string;
            fileUrl: string;
          } => Boolean(entry),
        );

      if (employeeDocs.length > 0) {
        await tx.employeeDocument.createMany({ data: employeeDocs });
      }

      await createAuditLog(tx, {
        userId: actorUserId,
        action: "CREATE",
        entityName: "User",
        entityId: createdUser.id,
        oldValue: null,
        newValue: JSON.stringify({
          username: createdUser.username,
          email: createdUser.email,
          phone: createdUser.phone,
          faydaId: createdUser.faydaId,
        }),
        ipAddress: null,
        userAgent: null,
      });

      await createAuditLog(tx, {
        userId: actorUserId,
        action: "CREATE",
        entityName: "Employee",
        entityId: employee.id,
        oldValue: null,
        newValue: JSON.stringify({
          userId: createdUser.id,
          employeeId: employee.id,
          organizationId: input.organizationId,
        }),
        ipAddress: null,
        userAgent: null,
      });

      return {
        user: createdUser,
        employee,
        documents: employeeDocs,
      };
    });

    return result;
  } catch (error) {
    rollbackMovedSecurityFiles();
    throw error;
  }
};
