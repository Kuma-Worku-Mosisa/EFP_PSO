// file: backend/src/modules/payment/payment.routes.ts

import { Router } from "express";
import {
  handleInitializePayment,
  handleTelebirrWebhook,
  handleTriggerRefund,
} from "./payment.controller";

const paymentRouter = Router();

/**
 * @route   POST /api/payments/initialize
 * @desc    Initiates a new license payment request and returns the Telebirr checkout link
 */
paymentRouter.post("/initialize", handleInitializePayment);

/**
 * @route   POST /api/payments/telebirr-callback
 * @desc    Asynchronous instant notification webhook fired from Telebirr's servers upon success
 */
paymentRouter.post("/telebirr-callback", handleTelebirrWebhook);

/**
 * @route   POST /api/payments/refund
 * @desc    Administrative action endpoint to reverse or return custom license fees
 */
paymentRouter.post("/refund", handleTriggerRefund);

export default paymentRouter;
