// src/modules/user/user.routes.ts
import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  getAllUsers,
  getCurrentUserHandler,
  updateProfileHandler,
  changePasswordHandler,
  revokeAccessHandler,
  getRolesHandler,
  uploadProfilePhotoHandler,
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
router.post("/register", registerValidation, registerHandler);

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
// Access control revocation route
router.patch(
  "/:id/revoke",
  authenticate,
  authorize(["system_admin", "super_admin"]),
  revokeAccessHandler,
);

export default router;
