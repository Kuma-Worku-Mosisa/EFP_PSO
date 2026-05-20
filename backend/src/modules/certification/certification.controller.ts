// filepath: backend/src/modules/certification/certification.controller.ts
import { Request, Response } from "express";
// CertificationService imported above
import {
  issueCertSchema,
  updateCertSchema,
  updateCertStatusSchema,
} from "./certification.validation";
import { CertificationService } from "./certification.service";

const parseRouteId = (value: string | string[]) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return Number.parseInt(raw, 10);
};

const getAuthenticatedUserId = (req: Request) => {
  const requester = (req as any).user;
  return Number(requester?.userId ?? requester?.id ?? NaN);
};

const hasAdminAccess = (req: Request) => {
  const rolesValue = (req as any).user?.roles;
  const roles = Array.isArray(rolesValue)
    ? rolesValue
    : typeof rolesValue === "string"
      ? rolesValue
          .split(",")
          .map((role: string) => role.trim())
          .filter(Boolean)
      : [];

  return roles.some((role) => String(role).toLowerCase().includes("admin"));
};

export const createCertification = async (req: Request, res: Response) => {
  try {
    const validated = issueCertSchema.parse(req.body);
    const result = await CertificationService.issueCertificate(validated);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCertification = async (req: Request, res: Response) => {
  try {
    const requesterId = getAuthenticatedUserId(req);
    if (!Number.isFinite(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const certId = parseRouteId(req.params.id);
    const applicantUserId =
      await CertificationService.getApplicantUserId(certId);

    if (!applicantUserId) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    if (!hasAdminAccess(req) && requesterId !== Number(applicantUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: not the certificate applicant",
      });
    }

    const data = await CertificationService.getFullDetails(certId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const listCertifications = async (req: Request, res: Response) => {
  try {
    const requesterId = getAuthenticatedUserId(req);
    if (!Number.isFinite(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const data = hasAdminAccess(req)
      ? await CertificationService.getAll()
      : await CertificationService.getByUserId(requesterId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateCertification = async (req: Request, res: Response) => {
  try {
    const validated = updateCertSchema.parse(req.body);
    const requesterId = getAuthenticatedUserId(req);
    if (!Number.isFinite(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const applicantUserId = await CertificationService.getApplicantUserId(
      parseRouteId(req.params.id),
    );

    if (!applicantUserId) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    if (!hasAdminAccess(req) && requesterId !== Number(applicantUserId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: not the certificate applicant",
      });
    }

    const data = await CertificationService.update(
      parseRouteId(req.params.id),
      validated,
    );
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyCertification = async (req: Request, res: Response) => {
  try {
    const raw = Array.isArray(req.params.serial)
      ? req.params.serial[0]
      : req.params.serial;
    // allow full QR URLs by extracting the last path segment
    const serial = raw.includes("/")
      ? raw.replace(/\/$/, "").split("/").pop() || raw
      : raw;
    const data = await CertificationService.verifyBySerial(String(serial));
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};

export const revokeCertification = async (req: Request, res: Response) => {
  try {
    await CertificationService.revoke(parseRouteId(req.params.id));
    res.status(200).json({ success: true, message: "Certificate Revoked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Revocation Failed" });
  }
};
