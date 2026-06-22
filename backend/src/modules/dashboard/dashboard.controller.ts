import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { ApiResponse } from "../../utils/apiResponse";

export class DashboardController {
  static async getAgencySummary(req: Request, res: Response) {
    try {
      const userId = Number(req.user?.userId ?? req.user?.id);
      if (!Number.isFinite(userId)) {
        return ApiResponse.error(res, "Unauthorized request", 401);
      }

      const data = await DashboardService.getAgencyDashboardSummary(userId);
      return ApiResponse.success(
        res,
        "Agency dashboard summary retrieved",
        data,
      );
    } catch (error: any) {
      console.error("Dashboard summary error:", error?.message || error);
      return ApiResponse.error(
        res,
        error?.message || "Failed to retrieve agency dashboard summary",
        500,
        error?.stack || null,
      );
    }
  }
}
