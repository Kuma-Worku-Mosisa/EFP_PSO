// src/modules/agreement/agreement.controller.ts
import { Request, Response } from "express";
import { AgreementService } from "./agreement.service";
import { ApiResponse } from "../../utils/apiResponse";

export class AgreementController {
  static async create(req: Request, res: Response) {
    try {
      // Read directly from body, completely bypassing req.user check
      const { applicationId, recruitmentDeadline } = req.body || {};

      if (!applicationId || !recruitmentDeadline) {
        return ApiResponse.error(
          res,
          "Missing required fields: applicationId and recruitmentDeadline are required",
          400,
        );
      }

      const agreement = await AgreementService.createOrganizationAgreement({
        applicationId: Number(applicationId),
        recruitmentDeadline,
      });

      return ApiResponse.success(
        res,
        "Contract generated successfully",
        agreement,
        201,
      );
    } catch (error: any) {
      if (error.message.includes("not found"))
        return ApiResponse.error(res, error.message, 404);
      return ApiResponse.error(
        res,
        error.message || "Internal Server Error",
        500,
      );
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { applicationId, organizationId, status, year, page, limit } =
        req.query;

      const filters = {
        applicationId: applicationId ? Number(applicationId) : undefined,
        organizationId: organizationId ? Number(organizationId) : undefined,
        status: status ? String(status) : undefined,
        year: year ? Number(year) : undefined,
      };

      const result = await AgreementService.getAllAgreements(
        filters,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
      );

      return ApiResponse.success(
        res,
        "Agreements retrieved successfully",
        result,
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Internal Server Error",
        500,
      );
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id))
        return ApiResponse.error(
          res,
          "Invalid agreement identity parameter",
          400,
        );

      const agreement = await AgreementService.getAgreementById(id);
      return ApiResponse.success(res, "Agreement found", agreement);
    } catch (error: any) {
      if (error.message.includes("not found"))
        return ApiResponse.error(res, error.message, 404);
      return ApiResponse.error(
        res,
        error.message || "Internal Server Error",
        500,
      );
    }
  }

  static async getMine(req: Request, res: Response) {
    try {
      const userId = req.user?.userId ?? req.user?.id;
      if (!userId) return ApiResponse.error(res, "Unauthorized request", 401);

      const agreement = await AgreementService.getLatestAgreementByUser(
        Number(userId),
      );
      return ApiResponse.success(res, "Agreement found", agreement);
    } catch (error: any) {
      if (error.message.includes("not found"))
        return ApiResponse.error(res, error.message, 404);
      return ApiResponse.error(
        res,
        error.message || "Internal Server Error",
        500,
      );
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (isNaN(id))
        return ApiResponse.error(res, "Invalid target parameters", 400);
      if (!status)
        return ApiResponse.error(
          res,
          "Status string variable is required",
          400,
        );

      const updatedAgreement = await AgreementService.updateAgreementStatus(
        id,
        { status },
      );
      return ApiResponse.success(
        res,
        "Agreement status altered successfully",
        updatedAgreement,
      );
    } catch (error: any) {
      if (error.message.includes("not found"))
        return ApiResponse.error(res, error.message, 404);
      return ApiResponse.error(
        res,
        error.message || "Internal Server Error",
        500,
      );
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id))
        return ApiResponse.error(
          res,
          "Invalid target entity configuration references",
          400,
        );

      const revokedAgreement = await AgreementService.deleteAgreement(id);
      return ApiResponse.success(
        res,
        "Agreement revoked and locked successfully",
        revokedAgreement,
      );
    } catch (error: any) {
      if (error.message.includes("not found"))
        return ApiResponse.error(res, error.message, 404);
      return ApiResponse.error(
        res,
        error.message || "Internal Server Error",
        500,
      );
    }
  }
}
