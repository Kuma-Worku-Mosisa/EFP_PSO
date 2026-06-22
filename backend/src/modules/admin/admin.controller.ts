import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const [
      totalOrganizations,
      totalAgreements,
      activeAgreements,
      pendingAgreements,
      totalApplications,
      totalInspections,
      totalUsers,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.agreement.count(),
      prisma.agreement.count({ where: { status: "Active" } }),
      prisma.agreement.count({ where: { status: "Pending" } }),
      prisma.application.count(),
      prisma.inspection.count(),
      prisma.user.count(),
    ]);

    const payload = {
      organizations: totalOrganizations,
      agreements: {
        total: totalAgreements,
        active: activeAgreements,
        pending: pendingAgreements,
      },
      applications: totalApplications,
      inspections: totalInspections,
      users: totalUsers,
    };

    return ApiResponse.success(res, "Admin summary retrieved", payload);
  } catch (error: any) {
    return ApiResponse.error(
      res,
      error?.message || "Failed to fetch admin summary",
      500,
    );
  }
}
