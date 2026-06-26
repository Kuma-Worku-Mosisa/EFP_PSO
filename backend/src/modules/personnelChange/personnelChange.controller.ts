import { Request, Response } from "express";
import { PersonnelChangeService } from "./personnelChange.service";

export const getPersonnelChangeRequests = async (
  req: Request,
  res: Response,
) => {
  try {
    const actorUserId = (req as any).user?.userId ?? (req as any).user?.id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const organizationId =
      Number((req as any).user?.organizationId ?? 0) || undefined;
    const requests =
      await PersonnelChangeService.getPersonnelChangeRequests(organizationId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error("getPersonnelChangeRequests error", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch personnel change requests",
    });
  }
};

export const createPersonnelChangeRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const payload = req.body || {};
    // Expecting requestType === 'NEW_EMPLOYEE'
    if (String(payload.requestType || "").toUpperCase() !== "NEW_EMPLOYEE") {
      return res.status(400).json({
        success: false,
        message:
          "Only NEW_EMPLOYEE requestType supported by this endpoint for now",
      });
    }

    const actorUserId = (req as any).user?.userId ?? (req as any).user?.id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to submit personnel change request.",
      });
    }

    const result = await PersonnelChangeService.createNewEmployeeRequest(
      payload,
      Number(actorUserId),
    );

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error("createPersonnelChangeRequest error", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to create personnel change request",
    });
  }
};

export const approvePersonnelChangeRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const requestId = Number(req.params.id);
    const actorUserId = (req as any).user?.userId ?? (req as any).user?.id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required to approve personnel change requests.",
      });
    }

    const result = await PersonnelChangeService.approvePersonnelChangeRequest(
      requestId,
      Number(actorUserId),
    );

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("approvePersonnelChangeRequest error", error);
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to approve personnel change request",
    });
  }
};

export const rejectPersonnelChangeRequest = async (
  req: Request,
  res: Response,
) => {
  try {
    const requestId = Number(req.params.id);
    const actorUserId = (req as any).user?.userId ?? (req as any).user?.id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to reject personnel change requests.",
      });
    }

    const reason = String(req.body.reason || "Rejected by admin");
    const result = await PersonnelChangeService.rejectPersonnelChangeRequest(
      requestId,
      Number(actorUserId),
      reason,
    );

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("rejectPersonnelChangeRequest error", error);
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to reject personnel change request",
    });
  }
};

export const verifyPersonnelChangeDocument = async (
  req: Request,
  res: Response,
) => {
  try {
    const requestId = Number(req.params.requestId);
    const documentId = Number(req.params.documentId);
    const actorUserId = (req as any).user?.userId ?? (req as any).user?.id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required to verify personnel change documents.",
      });
    }

    const result = await PersonnelChangeService.verifyPersonnelChangeDocument(
      requestId,
      documentId,
      Number(actorUserId),
    );

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("verifyPersonnelChangeDocument error", error);
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to verify personnel change document",
    });
  }
};

export const unverifyPersonnelChangeDocument = async (
  req: Request,
  res: Response,
) => {
  try {
    const requestId = Number(req.params.requestId);
    const documentId = Number(req.params.documentId);
    const actorUserId = (req as any).user?.userId ?? (req as any).user?.id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required to unverify personnel change documents.",
      });
    }

    const result = await PersonnelChangeService.unverifyPersonnelChangeDocument(
      requestId,
      documentId,
      Number(actorUserId),
    );

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("unverifyPersonnelChangeDocument error", error);
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to unverify personnel change document",
    });
  }
};
