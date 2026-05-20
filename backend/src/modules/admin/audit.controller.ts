import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { queryAuditLogs } from "../../utils/auditLogger";

export async function listAuditLogs(req: Request, res: Response) {
  try {
    // Parse and validate query params
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(
      1000,
      Math.max(1, Number(req.query.pageSize) || Number(req.query.limit) || 100),
    );
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const entityName = req.query.entityName
      ? String(req.query.entityName)
      : undefined;
    const action = req.query.action ? String(req.query.action) : undefined;
    const from = req.query.from ? String(req.query.from) : undefined;
    const to = req.query.to ? String(req.query.to) : undefined;

    // Basic validation
    if (req.query.userId && isNaN(Number(req.query.userId))) {
      return ApiResponse.error(res, "Invalid userId", 400);
    }
    if (
      req.query.page &&
      (isNaN(Number(req.query.page)) || Number(req.query.page) < 1)
    ) {
      return ApiResponse.error(res, "Invalid page", 400);
    }

    const result = await queryAuditLogs({
      page,
      pageSize,
      userId,
      entityName,
      from,
      to,
      action,
    });

    return ApiResponse.success(res, "Audit logs fetched", result);
  } catch (err: any) {
    console.error("Failed to fetch audit logs:", err);
    return ApiResponse.error(res, "Failed to fetch audit logs", 500);
  }
}

export default { listAuditLogs };
