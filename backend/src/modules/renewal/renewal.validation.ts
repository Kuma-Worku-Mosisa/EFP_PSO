import { z } from "zod";

export const validateRenewalEligibilitySchema = z.object({
  certificateSerialNumber: z
    .string()
    .trim()
    .min(1, "Certificate serial number is required"),
});

export const createRenewalApplicationSchema = z.object({
  certificateSerialNumber: z
    .string()
    .trim()
    .min(1, "Certificate serial number is required"),
  renewalYear: z.preprocess((value) => {
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : value;
    }
    return value;
  }, z.number().int().min(2000).max(2100).optional()),
  payload: z.string().optional(),
});
