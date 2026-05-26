import { Router } from "express";
import {
  getPublicFaqs,
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} from "./faq.controller";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/role";

const router = Router();

// Publicly Exposed Endpoints
router.get("/faqs", getPublicFaqs);

// Administrative FAQ management endpoint
router.get(
  "/faqs/manage",
  authenticate,
  authorize(["system_admin", "super_admin", "admin"]),
  getAllFaqs,
);

router.get("/faqs/:id", getFaqById);

// Protected System Management Endpoints
router.post("/faqs", createFaq);
router.put("/faqs/:id", updateFaq);
router.delete("/faqs/:id", deleteFaq);

export default router;
