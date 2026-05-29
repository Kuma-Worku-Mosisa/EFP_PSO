// filepath: backend/src/modules/certification/certification.controller.ts
import { Request, Response } from "express";
// CertificationService imported above
import {
  issueCertSchema,
  updateCertSchema,
  updateCertStatusSchema,
} from "./certification.validation";
import { CertificationService } from "./certification.service";
import prisma from "../../lib/prisma";
import multer from "multer";
import fs from "fs";
import path from "path";
import { buildPrefixedFilename } from "../../middleware/fileUpload";

const escapeHtml = (input: any) => {
  const s = String(input ?? "");
  return s.replace(/[&<>"'`]/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      case "`":
        return "&#96;";
      default:
        return c;
    }
  });
};

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

const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
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
    console.error("listCertifications error:", error);
    res.status(500).json({
      success: false,
      message: (error as any)?.message || "Server Error",
    });
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

export const uploadApplicantPhoto = async (req: Request, res: Response) => {
  try {
    const requesterId = getAuthenticatedUserId(req);
    if (!Number.isFinite(requesterId)) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const certId = parseRouteId(req.params.id);
    const applicantUserId = await CertificationService.getApplicantUserId(certId);

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

    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "certifications",
      String(certId),
    );
    ensureDirectory(uploadDir);

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) =>
        cb(null, buildPrefixedFilename("applicant_photo", file.originalname)),
    });

    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }).single("photo");

    upload(req as any, res as any, async (err: any) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err?.message || "Failed to upload photo",
        });
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "No photo file uploaded" });
      }

      const relativePath = `/uploads/certifications/${certId}/${file.filename}`;

      await prisma.user.update({
        where: { id: Number(applicantUserId) },
        data: { photoUrl: relativePath },
      });

      return res.status(200).json({
        success: true,
        message: "Applicant photo uploaded successfully",
        data: { photoUrl: relativePath },
      });
    });
  } catch (error: any) {
    console.error("uploadApplicantPhoto error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to upload applicant photo",
    });
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
    if (!data) {
      // If the client prefers HTML, show a friendly verification page
      if (req.accepts && req.accepts("html")) {
        res.status(404).send(`
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width,initial-scale=1" />
              <title>Certificate Verification</title>
              <style>
                body { font-family: Arial, Helvetica, sans-serif; background:#f6f8fb; color:#111; margin:0; padding:24px; }
                .card { max-width:800px; margin:40px auto; background:white; border-radius:8px; box-shadow:0 6px 18px rgba(20,30,60,0.08); overflow:hidden }
                .header { display:flex; align-items:center; gap:16px; padding:20px 28px; border-bottom:1px solid #eef2f7 }
                .logo { width:72px; height:72px; object-fit:contain; border-radius:6px; background:#fff; border:1px solid #eee }
                .title { font-size:18px; font-weight:700; color:#0b2545 }
                .body { padding:20px 28px }
                .row { display:flex; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px dashed #f1f5f9 }
                .label { color:#6b7280; font-size:13px }
                .value { color:#0b2545; font-weight:700 }
                .qr { width:140px; height:140px; border:1px solid #eee; padding:8px; background:#fff }
                .notfound { text-align:center; padding:48px 24px }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <img class="logo" src="/assets/official-logo.png" alt="EFP" />
                  <div>
                    <div class="title">Certificate Verification</div>
                    <div style="color:#475569;font-size:13px">The certificate serial you requested was not found.</div>
                  </div>
                </div>
                <div class="body notfound">
                  <h2 style="margin:0 0 8px 0">Certificate Not Found</h2>
                  <p style="margin:0;color:#6b7280">We couldn't locate a certificate with serial <strong>${String(serial)}</strong>.</p>
                </div>
              </div>
            </body>
          </html>
        `);
        return;
      }

      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    if (req.accepts && req.accepts("html")) {
      const cert = data as any;
      const org = cert.organization || {};
      const logo = org.logoUrl || "/assets/official-logo.png";
      const issue = new Date(cert.issueDate).toLocaleDateString();
      const expiry = new Date(cert.expiryDate).toLocaleDateString();
      const statusColor =
        cert.status && String(cert.status).toLowerCase() === "active"
          ? "#059669"
          : "#b91c1c";
      const levelLabel = String(cert.level || "—");
      const statusLabel = String(cert.status || "—");
      const amLevelLabel = levelLabel;
      const amStatusLabel = (() => {
        const key = String(cert.status || "").toLowerCase();
        if (key === "active") return "ንቁ";
        if (key === "revoked") return "የተሰረዘ";
        if (key === "expired") return "የተቃጠለ";
        return statusLabel;
      })();
      const enOrgName = org.nameEnglish || org.name || "—";
      const amOrgName = org.nameAmharic || org.name || "—";

      return res.status(200).send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <title>Certificate ${cert.certificateSerialNumber} — Verification</title>
            <style>
              body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:#f6f8fb; color:#0b2545; margin:0; padding:30px }
              .card { max-width:900px; margin:28px auto; background:#fff; border-radius:10px; box-shadow:0 8px 30px rgba(16,24,40,0.08); overflow:hidden }
              .header { display:flex; align-items:center; gap:18px; padding:22px 28px; border-bottom:1px solid #eef2f7 }
              .logo { width:86px; height:86px; object-fit:cover; border-radius:8px; background:#fff; border:1px solid #eef2f7 }
              .title { font-size:18px; font-weight:800 }
              .subtitle { font-size:13px; color:#6b7280 }
              .grid { padding:22px 28px }
              .section { border:1px solid #eef2f7; border-radius:12px; overflow:hidden }
              .sectionHead { padding:12px 16px; font-size:13px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; background:#f8fafc; border-bottom:1px solid #eef2f7 }
              .rows { padding:8px 16px 4px }
              .row { padding:12px 0; border-bottom:1px dashed #eef2f7; display:flex; justify-content:space-between; gap:14px; align-items:flex-start }
              .row:last-child { border-bottom:none }
              .label { color:#6b7280; font-size:13px; min-width:110px }
              .value { color:#0b2545; font-weight:700; font-size:15px; text-align:right; flex:1 }
              .valueAm { color:#0b2545; font-weight:700; font-size:15px; text-align:left; flex:1; direction:rtl; font-family:"Noto Sans Ethiopic", "Abyssinica SIL", "Noto Sans", sans-serif }
              .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:18px }
              .muted { color:#6b7280; font-size:13px }
              @media (max-width: 720px) {
                .card { margin: 12px; }
                .header { padding:16px 18px; gap:12px; }
                .logo { width:68px; height:68px; }
                .grid { padding:16px 18px; }
                .grid2 { grid-template-columns:1fr; gap:12px }
                .sectionHead { padding:10px 14px; }
                .rows { padding:6px 14px 2px; }
                .row { flex-direction:row; align-items:center; gap:10px; padding:10px 0 }
                .label { flex:0 0 40%; min-width:0; font-size:12px; line-height:1.2 }
                .value, .valueAm { flex:1; text-align:right; font-size:13px; line-height:1.25; word-break:break-word }
                .valueAm { text-align:left }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <img class="logo" src="${logo}" alt="Organization Logo" />
                <div>
                  <div class="title">${escapeHtml(cert.certificateSerialNumber)}</div>
                  <div class="subtitle">${escapeHtml(org.name || "—")}</div>
                </div>
              </div>
              <div class="grid">
                <div class="grid2">
                <div class="section">
                  <div class="sectionHead">English</div>
                  <div class="rows">
                    <div class="row"><div class="label">Organization Name</div><div class="value">${escapeHtml(enOrgName)}</div></div>
                    <div class="row"><div class="label">Level</div><div class="value">${escapeHtml(levelLabel)}</div></div>
                    <div class="row"><div class="label">Status</div><div class="value" style="color:${statusColor}">${escapeHtml(statusLabel)}</div></div>
                  </div>
                </div>

                <div class="section">
                  <div class="sectionHead">አማርኛ</div>
                  <div class="rows">
                    <div class="row"><div class="label">የተቋም ስም</div><div class="valueAm">${escapeHtml(amOrgName)}</div></div>
                    <div class="row"><div class="label">ደረጃ</div><div class="valueAm">${escapeHtml(amLevelLabel)}</div></div>
                    <div class="row"><div class="label">ሁኔታ</div><div class="valueAm" style="color:${statusColor}">${escapeHtml(amStatusLabel)}</div></div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
    }

    // Default JSON response for non-HTML clients
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
    console.error("revokeCertification error:", error);
    res.status(500).json({
      success: false,
      message: (error as any)?.message || "Revocation Failed",
    });
  }
};
