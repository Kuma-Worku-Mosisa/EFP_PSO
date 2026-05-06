// src/modules/user/user.routes.ts

import { Router } from "express";
import { registerHandler, loginHandler, getAllUsers } from "./user.controller";
import { registerValidation, loginValidation } from "./validation";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/", getAllUsers);
router.post("/register", registerValidation, registerHandler);
router.post("/login", loginValidation, loginHandler);
export default router;
