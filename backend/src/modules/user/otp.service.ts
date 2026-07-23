//filepath:backend/src/modules/user/otp.service.ts
const OTP_TTL_MS = 5 * 60 * 1000;

type OtpEntry = {
  code: string;
  email: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpEntry>();

const normalizeIdentifier = (identifier: string) =>
  String(identifier || "")
    .trim()
    .toLowerCase();

export const generateOtpCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const createOtpForUser = (identifier: string, email: string) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const code = generateOtpCode();
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpStore.set(normalizedIdentifier, {
    code,
    email,
    expiresAt,
  });

  return {
    code,
    expiresAt,
    expiresInMinutes: 5,
  };
};

export const verifyOtpForUser = (identifier: string, code: string) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const entry = otpStore.get(normalizedIdentifier);

  if (!entry) {
    return {
      valid: false,
      reason: "not_found" as const,
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedIdentifier);
    return {
      valid: false,
      reason: "expired" as const,
    };
  }

  if (String(code || "").trim() !== entry.code) {
    return {
      valid: false,
      reason: "invalid" as const,
    };
  }

  otpStore.delete(normalizedIdentifier);

  return {
    valid: true,
    reason: "valid" as const,
    expiresAt: entry.expiresAt,
  };
};
