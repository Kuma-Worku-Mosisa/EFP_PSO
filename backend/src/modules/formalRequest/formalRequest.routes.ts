import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  approveFormalRequest,
  createFormalRequest,
  getFormalRequestByUser,
  listFormalRequestsByUser,
  listFormalRequests,
  rejectFormalRequest,
  updateFormalRequestFeedback,
} from "./formalRequest.controller";
import { ApiResponse } from "../../utils/apiResponse";
import { fileFilter } from "../../middleware/fileUpload";
import { getDocumentUrl } from "../../utils/documentOrganizer";
import prisma from "../../lib/prisma";

const router = Router();

const FORMAL_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "formal_requests",
);

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "user";

const ensureUserFolder = (userId: number, label?: string) => {
  const safeLabel = label ? sanitizeSegment(label) : "user";
  const userDir = path.join(FORMAL_UPLOAD_DIR, `${userId}-${safeLabel}`);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
};

const resolveUserLabel = async (req: Request, userId: number) => {
  const fromBody =
    req.body?.userName || req.body?.fullName || req.body?.username || "";
  if (typeof fromBody === "string" && fromBody.trim()) {
    return fromBody;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, fullName: true },
  });

  return user?.username || user?.fullName || String(userId);
};

const createFormalRequestUploader = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const userId = Number((req as any).user?.id || req.body?.userId);
      if (!userId) {
        return cb(new Error("userId is required in form data"));
      }
      resolveUserLabel(req, userId)
        .then((label) => cb(null, ensureUserFolder(userId, label)))
        .catch((err) => cb(err as Error));
    },
    filename: (req, file, cb) => {
      const yearInput = String(
        req.body?.year || req.body?.renewalYear || "",
      ).trim();
      const year = /^\d{4}$/.test(yearInput)
        ? yearInput
        : String(new Date().getFullYear());
      const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
      cb(null, `${year}-formal_request_letter${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
};

router.post("/upload", (req: Request, res: Response) => {
  const uploader = createFormalRequestUploader();

  uploader.single("requestLetter")(req, res, (err) => {
    if (err) {
      return ApiResponse.error(res, err.message, 400);
    }

    const userId = Number((req as any).user?.id || req.body?.userId);
    if (!userId) {
      return ApiResponse.error(res, "userId is required", 400);
    }

    if (!req.file) {
      return ApiResponse.error(res, "requestLetter is required", 400);
    }

    const relativePath = path
      .relative(process.cwd(), req.file.path)
      .replace(/\\/g, "/");
    const requestLetterUrl = getDocumentUrl(relativePath);

    return ApiResponse.success(
      res,
      "Formal request letter uploaded",
      { requestLetterUrl },
      201,
    );
  });
});

router.post("/", createFormalRequest);
router.get("/", listFormalRequests);
router.get("/user/:userId/all", listFormalRequestsByUser);
router.get("/user/:userId", getFormalRequestByUser);
router.post("/:id/approve", approveFormalRequest);
router.post("/:id/reject", rejectFormalRequest);
router.patch("/:id/feedback", updateFormalRequestFeedback);

export default router;
