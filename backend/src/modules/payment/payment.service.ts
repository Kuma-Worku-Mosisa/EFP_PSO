import { telebirrConfig } from "../../config/telebirr.config";

import * as crypto from "crypto";

import prisma from "../../lib/prisma";



// Disable SSL certificate verification for development only

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



const createTimeStamp = () => Math.floor(Date.now() / 1000).toString();

const createNonceStr = () => crypto.randomBytes(16).toString("hex");



function signRequestObject(obj: Record<string, any>): string {

  const sortedKeys = Object.keys(obj).filter(k => k !== "sign" && k !== "sign_type").sort();

  const signString = sortedKeys

    .map(key => `${key}=${typeof obj[key] === "object" ? JSON.stringify(obj[key]) : obj[key]}`)

    .join("&");



  const sign = crypto.createSign("SHA256");

  sign.update(signString);

  return sign.sign(telebirrConfig.privateKey, "base64");

}



// Replace your existing applyFabricToken with this strictly for debugging:

export async function applyFabricToken(): Promise<string> {

  const url = `${telebirrConfig.baseUrl}/payment/v1/token`;



  // REPLACE THESE WITH YOUR ACTUAL VALUES FROM THE PORTAL

  const HARDCODED_APP_KEY = telebirrConfig.fabricAppId;

  const HARDCODED_APP_SECRET = telebirrConfig.appSecret;



  const response = await fetch(url, {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "X-APP-Key": HARDCODED_APP_KEY,

    },

    body: JSON.stringify({ appSecret: HARDCODED_APP_SECRET }),

  });



  const data = await response.json();

  

  // Log the raw result to see EXACTLY what the server says

  console.log("🔍 [DEBUG] RAW TOKEN RESPONSE:", JSON.stringify(data));



  if (!data.token) {

    throw new Error(`Token request failed: ${JSON.stringify(data)}`);

  }

  return data.token;

}



export async function createPreOrder(licenseId: number, amount: string, title: string) {

  const fabricToken = await applyFabricToken();

  const outTradeNo = `ERP${licenseId}${Date.now()}`;



  const bizContent = {

    appid: telebirrConfig.merchantAppId,

    business_type: "BuyGoods",

    merch_code: telebirrConfig.merchantCode,

    merch_order_id: outTradeNo,

    notify_url: "https://yourdomain.com/api/webhook",

    payee_identifier: telebirrConfig.merchantCode,

    payee_identifier_type: "04",

    payee_type: "3000",

    redirect_url: "http://localhost:3000/success",

    timeout_express: "120m",

    title: title,

    total_amount: amount,

    trade_type: "InApp",

    trans_currency: "ETB",

  };



  const payload = {

    method: "payment.preorder",

    nonce_str: createNonceStr(),

    timestamp: createTimeStamp(),

    version: "1.0",

    biz_content: bizContent

  };



  const reqObject = {

    ...payload,

    sign: signRequestObject(payload),

    sign_type: "SHA256WithRSA"

  };



  const response = await fetch(`${telebirrConfig.baseUrl}/payment/v1/merchant/preOrder`, {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "X-APP-Key": telebirrConfig.fabricAppId,

      "Authorization": fabricToken,

    },

    body: JSON.stringify(reqObject),

  });



  const result = await response.json();

  

  if (result.result !== "SUCCESS") {

    throw new Error(`Telebirr Error: ${result.msg || JSON.stringify(result)}`);

  }



  // Create PaymentTransaction record for tracking

  try {

    await prisma.paymentTransaction.create({

      data: {

        outTradeNo: outTradeNo,

        amount: amount,

        status: "PENDING",

        licenseId: licenseId,

      },

    });

  } catch (dbError) {

    console.error("Failed to create PaymentTransaction record:", dbError);

    // Don't throw here - allow payment to proceed even if DB record fails

  }



  return result;

}



export async function processRefund(transactionId: string, amount: string, reason: string) {

  try {

    // Find the PaymentTransaction record

    const paymentTransaction = await prisma.paymentTransaction.findUnique({

      where: { outTradeNo: transactionId },

    });



    if (!paymentTransaction) {

      throw new Error(`Payment transaction with outTradeNo ${transactionId} not found`);

    }



    const fabricToken = await applyFabricToken();



    const bizContent = {

      appid: telebirrConfig.merchantAppId,

      merch_code: telebirrConfig.merchantCode,

      out_trade_no: transactionId,

      refund_amount: amount,

      refund_reason: reason || "Refund requested",

    };



    const payload = {

      method: "payment.refund",

      nonce_str: createNonceStr(),

      timestamp: createTimeStamp(),

      version: "1.0",

      biz_content: bizContent

    };



    const reqObject = {

      ...payload,

      sign: signRequestObject(payload),

      sign_type: "SHA256WithRSA"

    };



    const response = await fetch(`${telebirrConfig.baseUrl}/payment/v1/merchant/refund`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "X-APP-Key": telebirrConfig.fabricAppId,

        "Authorization": fabricToken,

      },

      body: JSON.stringify(reqObject),

    });



    const result = await response.json();



    if (result.result !== "SUCCESS") {

      // Create failed refund ledger entry

      try {

        await prisma.refundLedger.create({

          data: {

            refundRequestNo: `REF${Date.now()}`,

            paymentId: paymentTransaction.id,

            actualAmount: amount,

            reason: reason || "Refund requested",

            status: "REFUND_FAILED",

          },

        });

      } catch (dbError) {

        console.error("Failed to create RefundLedger record:", dbError);

      }

      throw new Error(`Telebirr Refund Error: ${result.msg || JSON.stringify(result)}`);

    }



    // Create successful refund ledger entry

    try {

      await prisma.refundLedger.create({

        data: {

          refundRequestNo: `REF${Date.now()}`,

          telebirrRefundId: result.refund_order_id || null,

          paymentId: paymentTransaction.id,

          actualAmount: amount,

          reason: reason || "Refund requested",

          status: "REFUND_SUCCESS",

        },

      });

    } catch (dbError) {

      console.error("Failed to create RefundLedger record:", dbError);

    }



    return {

      success: true,

      message: "Refund processed successfully",

      data: result

    };

  } catch (error: any) {

    console.error("❌ [Refund Processing Error]:", error.message);

    throw new Error(`Failed to process refund: ${error.message}`);

  }

}