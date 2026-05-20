// src/modules/user/user.routes.ts
import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  getAllUsers,
  updateProfileHandler,
  changePasswordHandler,
  revokeAccessHandler,
  getRolesHandler,
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
router.put("/me", authenticate, profileValidation, updateProfileHandler);
router.put(
  "/me/password",
  authenticate,
  changePasswordValidation,
  changePasswordHandler,
);

// --- ADMINISTRATIVE MANAGEMENT ROUTES (SYSTEM / SUPER ADMIN) ---
// Allowed both roles here so your token works seamlessly
router.get(
  "/",
  authenticate,
  authorize(["system_admin", "super_admin"]),
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
  authorize(["system_admin", "super_admin"]),
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
