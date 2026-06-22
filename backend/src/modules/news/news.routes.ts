import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileFilter, buildPrefixedFilename } from "../../middleware/fileUpload";
import {
  getPublicNews,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from "./news.controller";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/role";

const router = Router();

// Public news listing
router.get("/news", getPublicNews);

// Admin news management - must come BEFORE /news/:id to avoid matching :id as "manage"
router.get(
  "/news/manage",
  authenticate,
  authorize(["system_admin", "super_admin", "admin"]),
  getAllNews,
);

// Public single news item
router.get("/news/:id", getNewsById);
// Configure multer for news image uploads (stores under uploads/news)
const NEWS_UPLOAD_DIR = path.join(process.cwd(), "uploads", "news");
if (!fs.existsSync(NEWS_UPLOAD_DIR)) {
  fs.mkdirSync(NEWS_UPLOAD_DIR, { recursive: true });
}

const newsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, NEWS_UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(null, buildPrefixedFilename("news", file.originalname)),
});

const newsUploader = multer({
  storage: newsStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/news",
  authenticate,
  authorize(["system_admin", "super_admin", "admin"]),
  newsUploader.single("image"),
  createNews,
);
router.put(
  "/news/:id",
  authenticate,
  authorize(["system_admin", "super_admin", "admin"]),
  newsUploader.single("image"),
  updateNews,
);
router.delete(
  "/news/:id",
  authenticate,
  authorize(["system_admin", "super_admin", "admin"]),
  deleteNews,
);

export default router;
