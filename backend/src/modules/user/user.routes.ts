// src/modules/user/user.routes.ts
import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  sendLoginOtpHandler,
  verifyLoginOtpHandler,
  getAllUsers,
  getUserByIdHandler,
  getCurrentUserHandler,
  updateProfileHandler,
  changePasswordHandler,
  revokeAccessHandler,
  getRolesHandler,
  validateUserFieldHandler,
  uploadProfilePhotoHandler,
  sendRegisterEmailOtpHandler,
  verifyRegisterEmailOtpHandler,
  forgotPasswordHandler,
  verifyResetTokenHandler,
  resetPasswordHandler,
} from "./user.controller";
import {
  registerValidation,
  loginValidation,
  profileValidation,
  changePasswordValidation,
} from "./validation";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

// --- PUBLIC ROUTES ---
router.post("/login", loginValidation, loginHandler);
router.post("/login/otp/send", sendLoginOtpHandler);
router.post("/login/otp/verify", verifyLoginOtpHandler);
router.post("/register", registerValidation, registerHandler);
router.post("/register/email-otp/send", sendRegisterEmailOtpHandler);
router.post("/register/email-otp/verify", verifyRegisterEmailOtpHandler);
router.get("/validate", validateUserFieldHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.get("/reset-password/verify", verifyResetTokenHandler);
router.post("/reset-password", resetPasswordHandler);

// --- PROTECTED ROUTES (ANY AUTHENTICATED USER) ---
router.get("/me", authenticate, getCurrentUserHandler);
router.put("/me", authenticate, profileValidation, updateProfileHandler);
router.put(
  "/me/password",
  authenticate,
  changePasswordValidation,
  changePasswordHandler,
);

// Upload profile photo and persist path to user.photoUrl
router.post("/me/photo", authenticate, uploadProfilePhotoHandler);
// --- ADMINISTRATIVE MANAGEMENT ROUTES (SYSTEM / SUPER ADMIN) ---
// Allowed both roles here so your token works seamlessly
router.get(
  "/",
  authenticate,
  // Allow administrators to list users for operational tasks (e.g., assigning reviewers)
  authorize(["system_admin", "super_admin", "admin"]),
  getAllUsers,
);
router.put(
  "/:id",
  authenticate,
  authorize(["system_admin", "super_admin"]),
  updateProfileHandler,
);
// Dynamic operational backend roles route for user provisioning forms
router.get(
  "/roles",
  authenticate,
  authorize(["system_admin", "super_admin", "admin"]),
  getRolesHandler,
);
router.get(
  "/:id",
  authenticate,
  authorize(["system_admin", "super_admin"]),
  getUserByIdHandler,
);
// Access control revocation route
router.patch(
  "/:id/revoke",
  authenticate,
  authorize(["system_admin", "super_admin"]),
  revokeAccessHandler,
);

export default router;
