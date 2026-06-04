// file: backend/src/modules/payment/telebirr.utils.ts

import crypto from "crypto";

export function createTimeStamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function createNonceStr(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function signRequestObject(
  payload: Record<string, any>,
  privateKeyStr: string,
): string {
  const { sign, sign_type, ...filteredPayload } = payload;

  // 1. Recursively sort all object keys alphabetically (Telebirr Strict Requirement)
  const sortObject = (obj: any): any => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      return obj;
    return Object.keys(obj)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = sortObject(obj[key]);
          return acc;
        },
        {} as Record<string, any>,
      );
  };

  const sortedPayload = sortObject(filteredPayload);

  // 2. Build the signature target string (a=1&b=2 format)
  const stringComponents = Object.keys(sortedPayload)
    .sort()
    .map((key) => {
      const val = sortedPayload[key];
      // In Node, JSON.stringify on a sorted object preserves order and omits spaces
      const serializedValue =
        typeof val === "object" ? JSON.stringify(val) : String(val);
      return `${key}=${serializedValue}`;
    });

  const signatureTargetString = stringComponents.join("&");

  // 3. Sign with RSA SHA256
  const signEngine = crypto.createSign("SHA256");
  signEngine.update(signatureTargetString);
  signEngine.end();

  return signEngine.sign(privateKeyStr, "base64");
}
