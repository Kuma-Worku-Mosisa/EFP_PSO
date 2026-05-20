// src/modules/agreement/agreement.routes.ts
import { Router } from "express";
import { AgreementController } from "./agreement.controller";
import { authenticate } from "../../middleware/auth";

const agreementRouter = Router();

// CRUD Endpoints Mapping
agreementRouter.post("/generate", AgreementController.create); // Create
agreementRouter.get("/", AgreementController.getAll); // Read All
agreementRouter.get("/me", authenticate, AgreementController.getMine); // Read Current User
agreementRouter.get("/:id", AgreementController.getById); // Read One
agreementRouter.patch("/:id/status", AgreementController.updateStatus); // Update Status Only
agreementRouter.delete("/:id", AgreementController.remove); // Soft Delete / Revoke

export default agreementRouter;
