// filepath: backend/src/modules/settings/system-settings.routes.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { getConfig, updateConfig } from "./system-settings.controller";
import { getRelativeTempFilePath } from "../../middleware/fileUpload";
import { getDocumentUrl } from "../../utils/documentOrganizer";

const router = Router();

// Public or Admin endpoint to get the active EFP metadata/branding
router.get("/", getConfig);

// Protected Admin endpoint to update system settings dynamically
router.put("/", updateConfig);

// Upload endpoint for staging EFP logo before finalizing in system settings
// Expects form field name: `efp_logo`
router.post("/upload", (req: Request, res: Response, next) => {
  // build tmp upload dir: uploads/_tmp/efp/organization
  const tmpDir = path.join(
    process.cwd(),
    "uploads",
    "_tmp",
    "efp",
    "organization",
  );
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, tmpDir),
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const uniqueSuffix = crypto.randomUUID().replace(/-/g, "");
      const sanitized = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase();
      cb(null, `${timestamp}-${uniqueSuffix}-${sanitized}`);
    },
  });

  const upload = multer({ storage }).single("efp_logo");

  upload(req, res, (err: any) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    // build relative temp path for response
    const rel = getRelativeTempFilePath(
      "efp",
      "organization",
      req.file.filename,
    );
    const url = getDocumentUrl(rel);

    return res.status(200).json({ success: true, url, path: rel });
  });
});

export default router;
