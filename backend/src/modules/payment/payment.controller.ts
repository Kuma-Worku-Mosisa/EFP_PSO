// file: backend/src/modules/payment/payment.controller.ts

import { Request, Response } from "express";
import { createPreOrder, processRefund } from "./payment.service";
import prisma from "../../lib/prisma";

/**
 * Initializes a new payment request by obtaining a Fabric token 
 * and placing a preorder request to the Telebirr SuperApp gateway.
 */
export async function handleInitializePayment(req: Request, res: Response) {
  try {
    const { licenseId, amount, title } = req.body;

    if (!licenseId || !amount || !title) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const result = await createPreOrder(Number(licenseId), amount, title);
    return res.status(200).json(result);
  } catch (err: any) {
    // 🔴 ADDED DEBUG LOGGING HERE
    console.error("❌ [Payment Initialization Error]:", err.message);
    if (err.cause) {
      console.error("🔍 [Detailed Fetch Cause]:", err.cause);
      console.error("🔍 [Error Code]:", err.cause.code);
    }

    return res.status(400).json({
      success: false,
      error: err.message,
      debug: err.cause ? err.cause.message : "No further details",
    });
  }
}

/**
 * Handles asynchronous notification webhooks fired by Telebirr upon 
 * successful user checkout.
 */
export async function handleTelebirrWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;

    // Log the payload to see exactly what Telebirr sends
    console.log(
      "📥 [Telebirr Webhook Received]:",
      JSON.stringify(payload, null, 2),
    );

    // Handle potential key variations between Sandbox and Production
    const tradeStatus = payload.trade_status || payload.tradeStatus;
    const outTradeNo = payload.merch_order_id || payload.outTradeNo;
    const transactionId = payload.trans_id || payload.transactionId;

    if (tradeStatus === "Completed" && outTradeNo) {
      // 1. Update the Payment Transaction record
      await prisma.paymentTransaction.update({
        where: { outTradeNo: outTradeNo },
        data: {
          status: "SUCCESS",
          transactionId: transactionId,
        },
      });

      // NOTE: You may also want to update your License status here!
      // Example: await prisma.license.update({ where: { id: relatedLicenseId }, data: { status: "ACTIVE" }});

      // 2. Telebirr expects a strict { code: "0" } response to acknowledge receipt
      return res
        .status(200)
        .json({ code: "0", message: "Processed successfully" });
    }

    console.log(
      "⚠️ [Webhook Ignored]: Transaction status incomplete or missing order ID.",
    );
    // Return 200 so Telebirr stops retrying, even if we didn't process it as a success
    return res
      .status(200)
      .json({ code: "1", message: "Transaction status incomplete" });
  } catch (err: any) {
    console.error("❌ [Webhook Processing Fault]:", err.message);
    // Returning 500 will cause Telebirr to retry sending the webhook later
    return res.status(500).json({ error: "Internal Webhook Processing Fault" });
  }
}

/**
 * Triggers an official refund request via the Telebirr payment engine 
 * for processed transactions.
 */
export async function handleTriggerRefund(req: Request, res: Response) {
  try {
    const { transactionId, amount, reason } = req.body;

    if (!transactionId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: transactionId or amount",
      });
    }

    const result = await processRefund(
      transactionId,
      amount,
      reason || "Requested by admin",
    );
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ [Refund Error]:", err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
}