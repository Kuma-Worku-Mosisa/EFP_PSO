import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ApiResponse } from "../../utils/apiResponse";
import { approveAddressChange } from "./address-request.service";
import { ServiceError } from "../../utils/errors";

export const processAddressChangeRequestHandler = async (
  req: Request,
  res: Response,
) => {
  const requestId = Number(req.params.requestId);
  const adminId = Number(req.user?.id ?? 0);
  const { status, feedback } = req.body as {
    status?: string;
    feedback?: string;
  };

  if (!Number.isFinite(requestId) || requestId <= 0) {
    return ApiResponse.error(res, "Invalid address request id.", 400);
  }

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return ApiResponse.error(res, "Status must be APPROVED or REJECTED.", 400);
  }

  try {
    if (status === "APPROVED") {
      const result = await approveAddressChange(requestId, adminId);
      const normalized = {
        id: result.addressRequestId,
        status: result.status?.toString().toUpperCase() || "APPROVED",
        adminFeedback: result.adminFeedback ?? null,
      };
      return ApiResponse.success(
        res,
        "Address change request approved.",
        normalized,
      );
    }

    // REJECTED path
    const request = await prisma.organizationAddressChangeRequest.findUnique({
      where: { addressRequestId: requestId },
    });

    if (!request) {
      return ApiResponse.error(res, "Address change request not found.", 404);
    }

    if (request.status !== "PENDING") {
      return ApiResponse.error(
        res,
        "Address change request already processed.",
        400,
      );
    }

    // Verify admin permission before allowing rejection
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: { user_roles: { include: { roles: true } } },
    });
    if (!admin) {
      return ApiResponse.error(res, "Admin user not found.", 404);
    }
    const hasPermission = (admin.user_roles || []).some((ur) => {
      const rn = ur.roles?.role_name?.toString().toLowerCase();
      return rn === "administrator" || rn === "admin" || rn === "manager";
    });
    if (!hasPermission) {
      return ApiResponse.error(
        res,
        "User not authorized to reject address changes",
        403,
      );
    }

    const updated = await prisma.organizationAddressChangeRequest.update({
      where: { addressRequestId: requestId },
      data: {
        status: "REJECTED",
        adminFeedback: feedback?.trim() || null,
      },
    });

    return ApiResponse.success(
      res,
      "Address change request rejected.",
      updated,
    );
  } catch (error: any) {
    if (error instanceof ServiceError) {
      const statusCode =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "FORBIDDEN"
            ? 403
            : error.code === "BAD_REQUEST"
              ? 400
              : 500;
      return ApiResponse.error(res, error.message, statusCode, error.code);
    }

    console.error(
      "Process Address Change Request Error:",
      error?.message ?? error,
    );
    return ApiResponse.error(
      res,
      "Failed to process address change request.",
      500,
      error?.message ?? String(error),
    );
  }
};
