import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";

/**
 * GET /api/employees/my-organization
 * Returns the organization associated with the current user's employee record,
 * including the organization's employees (with user and position info).
 */
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
