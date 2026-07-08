//filepath: backend/src/modules/regularReport/regularReport.routes.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { RegularReportController } from "./regularReport.controller";
import { authenticate } from "../../middleware/auth";
import {
  buildPrefixedFilename,
  resolveOrganizationFolderName,
} from "../../middleware/fileUpload";
import prisma from "../../lib/prisma";

const router = Router();
const controller = new RegularReportController();

const getOrganizationFolderName = async (req: any) => {
  const organizationName = String(req.body?.organizationName || "").trim();
  if (organizationName) {
    return resolveOrganizationFolderName(organizationName);
  }

  const organizationId = Number(
    req.body?.organizationId ||
      req.user?.organizationId ||
      req.user?.organization?.id ||
      0,
  );

  if (!organizationId) {
    return "organization";
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { nameEnglish: true, nameAmharic: true },
  });

  return resolveOrganizationFolderName(
    organization?.nameEnglish || organization?.nameAmharic || "organization",
  );
};

const createRegularReportStorage = () =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      getOrganizationFolderName(req)
        .then((folderName) => {
          const uploadDir = path.join(
            process.cwd(),
            "uploads",
            "organization",
            folderName,
            "regular-reports",
          );

          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        })
        .catch((error) => cb(error as Error, ""));
    },
    filename: (req, file, cb) => {
      cb(null, buildPrefixedFilename(file.fieldname, file.originalname));
    },
  });

const upload = multer({
  storage: createRegularReportStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"));
    }
  },
});

router.post(
  "/submit",
  authenticate,
  upload.fields([
    { name: "report", maxCount: 1 },
    { name: "reporterSignature", maxCount: 1 },
    { name: "supplementaryDocument", maxCount: 1 },
    { name: "periodDocument", maxCount: 1 },
  ]),
  (req, res, next) => controller.submit(req, res, next),
);
router.put(
  "/:id/review",
  authenticate,
  upload.fields([
    { name: "efpOfficerSignature", maxCount: 1 },
    { name: "superiorSignature", maxCount: 1 },
  ]),
  (req, res, next) => controller.updateReview(req, res, next),
);
router.get("/", authenticate, (req, res, next) =>
  controller.list(req, res, next),
);

export default router;
