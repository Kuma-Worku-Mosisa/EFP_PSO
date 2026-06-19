import { Request, Response } from "express";
import { TransfersService } from "./transfers.service";

export class TransfersController {
  private service = new TransfersService();

  lookupEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = String(req.query.query ?? "").trim();
      if (!query) {
        res.status(400).json({
          success: false,
          error: "Query parameter is required.",
        });
        return;
      }

      console.log(`[Transfer Lookup] Searching for employee: "${query}"`);
      const result = await this.service.lookupEmployee(query);

      if (!result) {
        console.log(
          `[Transfer Lookup] Employee not found for query: "${query}"`,
        );
        res.status(404).json({
          success: false,
          error: "Employee not found for the provided identifier.",
        });
        return;
      }

      console.log(`[Transfer Lookup] Found employee:`, result.faydaId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error(`[Transfer Lookup] Error:`, error.message);
      res.status(400).json({ success: false, error: error.message });
    }
  };

  getIncomingPendingRequests = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const organizationId = Number(req.user?.organizationId);

      if (!organizationId || Number.isNaN(organizationId)) {
        res.status(400).json({
          success: false,
          error: "Organization context is required to fetch incoming requests.",
        });
        return;
      }

      const result =
        await this.service.getIncomingPendingRequests(organizationId);

      const normalized = result.map((request) => ({
        ...request,
        sourceOrganization: {
          name: request.sourceOrganization?.nameEnglish || "Unknown",
        },
        targetOrganization: {
          name: request.targetOrganization?.nameEnglish || "Unknown",
        },
      }));

      res.status(200).json({ success: true, data: normalized });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  getTransferHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = Number(req.user?.organizationId);

      if (!organizationId || Number.isNaN(organizationId)) {
        res.status(400).json({
          success: false,
          error: "Organization context is required to fetch transfer history.",
        });
        return;
      }

      const result =
        await this.service.getTransferHistoryForOrganization(organizationId);

      const normalized = result.map((request) => ({
        ...request,
        sourceOrganization: {
          id: request.sourceOrganization?.id ?? 0,
          name: request.sourceOrganization?.nameEnglish || "Unknown",
        },
        targetOrganization: {
          id: request.targetOrganization?.id ?? 0,
          name: request.targetOrganization?.nameEnglish || "Unknown",
        },
      }));

      const initiated = normalized.filter(
        (request) => request.sourceOrganizationId === organizationId,
      );
      const incoming = normalized.filter(
        (request) => request.targetOrganizationId === organizationId,
      );

      res.status(200).json({
        success: true,
        data: {
          initiated,
          incoming,
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  initiate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, targetOrganizationId, requestedPositionId, reason } =
        req.body;
      const initiatedById = Number(req.user?.id ?? 0);
      const initiatorOrganizationId = Number(req.user?.organizationId ?? 0);
      const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

      if (
        initiatorOrganizationId === 0 &&
        !roles.includes("system_admin") &&
        !roles.includes("super_admin")
      ) {
        res.status(403).json({
          success: false,
          error:
            "Organization context is required to initiate transfer requests.",
        });
        return;
      }

      // If frontend omitted targetOrganizationId, default to initiator's organization
      const resolvedTargetOrganizationId =
        targetOrganizationId && Number.isFinite(Number(targetOrganizationId))
          ? Number(targetOrganizationId)
          : initiatorOrganizationId;

      const result = await this.service.initiateTransfer({
        employeeId: Number(employeeId),
        targetOrganizationId: Number(resolvedTargetOrganizationId),
        requestedPositionId: requestedPositionId
          ? Number(requestedPositionId)
          : undefined,
        reason,
        initiatedById,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  handleDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, rejectionReason } = req.body; // 'RELEASE' | 'FINALIZE_APPROVE' | 'REJECT'

      const actionedById = req.user?.id || 2;
      const userOrganizationId = req.user?.organizationId || 2;

      const validActions = ["RELEASE", "FINALIZE_APPROVE", "REJECT"];
      if (!validActions.includes(action)) {
        res.status(400).json({
          success: false,
          error: "Invalid operational parameter configuration.",
        });
        return;
      }

      const result = await this.service.processTransferDecision(
        Number(id),
        action,
        Number(actionedById),
        Number(userOrganizationId),
        rejectionReason,
      );

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
}
