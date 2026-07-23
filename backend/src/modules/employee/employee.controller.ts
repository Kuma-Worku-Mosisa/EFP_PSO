import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import {
  registerEmployee,
  ServiceError,
  updateEmployeeBlacklistStatus,
  updateEmployeeEmploymentStatus,
} from "./employee.service";
import prisma from "../../lib/prisma";

const getAuditUserId = (req: Request): number | null => {
  const rawUserId = req.user?.userId ?? req.user?.id ?? null;
  if (typeof rawUserId === "string") {
    const parsed = Number(rawUserId);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return typeof rawUserId === "number" ? rawUserId : null;
};

export const registerEmployeeHandler = async (req: Request, res: Response) => {
  const {
    username,
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    faydaId,
    positionId,
    educationLevel,
    workExpYears,
    TotalExpYears,
    gender,
    citizenship,
    age,
    startedDate,
    organizationId,
    kebeleId,
    houseNo,
    specialLocation,
    uploadedFiles,
  } = req.body;

  if (!password || !confirmPassword || password !== confirmPassword) {
    return ApiResponse.error(
      res,
      "Password and confirm password must match",
      400,
    );
  }

  if (!username || !fullName || !email || !phone || !password || !faydaId) {
    return ApiResponse.error(
      res,
      "Missing required employee registration fields",
      400,
    );
  }

  if (!organizationId || !kebeleId) {
    return ApiResponse.error(
      res,
      "Organization and kebele identifiers are required",
      400,
    );
  }

  try {
    const actorUserId = getAuditUserId(req);
    const result = await registerEmployee(
      {
        username,
        fullName,
        email,
        phone,
        password,
        faydaId,
        positionId: positionId ? Number(positionId) : null,
        educationLevel: educationLevel || null,
        workExpYears: workExpYears ? Number(workExpYears) : null,
        TotalExpYears: TotalExpYears ? Number(TotalExpYears) : null,
        gender: gender || null,
        citizenship: citizenship || null,
        age: age ? Number(age) : null,
        startedDate: startedDate || null,
        organizationId: Number(organizationId),
        kebeleId: Number(kebeleId),
        houseNo: houseNo || null,
        specialLocation: specialLocation || null,
        uploadedFiles:
          typeof uploadedFiles === "object" && uploadedFiles
            ? uploadedFiles
            : undefined,
      },
      actorUserId,
    );

    return ApiResponse.success(
      res,
      "Employee registered successfully",
      result,
      201,
    );
  } catch (error: any) {
    if (error instanceof ServiceError) {
      const statusCode = error.code.startsWith("DUPLICATE_") ? 409 : 400;
      return ApiResponse.error(res, error.message, statusCode, error.code);
    }

    console.error("Register Employee Error:", error?.message ?? error);
    return ApiResponse.error(
      res,
      "Failed to register employee",
      500,
      error?.message ?? String(error),
    );
  }
};

/**
 * GET /api/employees/my-organization
 * Returns the organization associated with the current user's employee record,
 * including the organization's employees (with user and position info).
 */
export const updateEmployeeStatusHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const { status } = req.body || {};

    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      return ApiResponse.error(res, "Invalid employee id", 400);
    }

    if (typeof status !== "string" || !status.trim()) {
      return ApiResponse.error(res, "Employee status is required", 400);
    }

    const actorUserId = getAuditUserId(req);
    const updatedEmployee = await updateEmployeeEmploymentStatus(
      employeeId,
      status,
      actorUserId,
    );

    return ApiResponse.success(
      res,
      "Employee status updated successfully",
      updatedEmployee,
      200,
    );
  } catch (error: any) {
    if (error instanceof ServiceError) {
      return ApiResponse.error(res, error.message, 400, error.code);
    }

    console.error("Update Employee Status Error:", error?.message ?? error);
    return ApiResponse.error(
      res,
      "Failed to update employee status",
      500,
      error?.message ?? String(error),
    );
  }
};

export const updateEmployeeBlacklistHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const { isBlacklisted } = req.body || {};

    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      return ApiResponse.error(res, "Invalid employee id", 400);
    }

    if (typeof isBlacklisted !== "boolean") {
      return ApiResponse.error(res, "isBlacklisted must be a boolean", 400);
    }

    const actorUserId = getAuditUserId(req);
    const updatedEmployee = await updateEmployeeBlacklistStatus(
      employeeId,
      isBlacklisted,
      actorUserId,
    );

    return ApiResponse.success(
      res,
      "Employee blacklist status updated successfully",
      updatedEmployee,
      200,
    );
  } catch (error: any) {
    if (error instanceof ServiceError) {
      return ApiResponse.error(res, error.message, 400, error.code);
    }

    console.error("Update Employee Blacklist Error:", error?.message ?? error);
    return ApiResponse.error(
      res,
      "Failed to update employee blacklist status",
      500,
      error?.message ?? String(error),
    );
  }
};

export const getMyOrganizationHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.error(res, "Not authenticated", 401);
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: Number(userId) },
      include: {
        organization: {
          include: {
            employees: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    faydaId: true,
                    email: true,
                    phone: true,
                  },
                },
                position: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!employee || !employee.organization) {
      return ApiResponse.error(res, "Employee or organization not found", 404);
    }

    const org = employee.organization;

    // Map employees to a client-friendly shape
    const employees = (org.employees || []).map((e) => ({
      id: e.id,
      userId: e.userId,
      fullName: e.user?.fullName ?? "",
      faydaId: e.user?.faydaId ?? "",
      email: e.user?.email ?? "",
      phone: e.user?.phone ?? "",
      positionName: e.position?.name ?? "",
      employmentStatus: e.employmentStatus ?? "",
      employmentStartDate: e.employmentStartDate
        ? new Date(e.employmentStartDate).toISOString().split("T")[0]
        : "",
    }));

    const payload = {
      organizationId: org.id,
      nameEnglish: org.nameEnglish,
      nameAmharic: org.nameAmharic,
      email: org.email,
      phone: org.phone,
      employees,
    };

    return ApiResponse.success(res, "User organization retrieved", payload);
  } catch (error: any) {
    console.error("Get My Organization Error:", error?.message ?? error);
    return ApiResponse.error(
      res,
      "Failed to fetch user's organization",
      500,
      error?.message ?? String(error),
    );
  }
};