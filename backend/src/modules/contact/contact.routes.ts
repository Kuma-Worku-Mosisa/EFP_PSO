//file: src/modules/contact/contact.routes.ts
import { Router } from "express";
import {
  submitContactHandler,
  getMyMessagesHandler,
  getRoleInfoHandler,
} from "./contact.controller";
// import { requireAuth } from "../../middleware/auth"; // Your auth middleware

const router = Router();

// Public route: Website users submitting a message
router.post("/submit", submitContactHandler);

// Public: fetch contact info (email/phone) for a given role
router.get("/role-info", getRoleInfoHandler);

// Protected route: Department heads viewing messages sent specifically to them
router.get("/my-messages", /* requireAuth, */ getMyMessagesHandler);

export default router;
