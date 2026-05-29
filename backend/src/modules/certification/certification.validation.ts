// filepath: backend/src/modules/certification/certification.validation.ts
import { z } from "zod";

export const issueCertSchema = z.object({
  applicationId: z.number().int().positive(),
  organizationId: z.number().int().positive(),
  level: z.coerce.number().int().optional().default(3),
});

export const updateCertStatusSchema = z.object({
  status: z.enum(["Active", "EXPIRED", "Expired", "Revoked", "Suspended"]),
});

export const updateCertSchema = z.object({
  level: z.coerce.number().int().optional(),
  status: z
    .enum(["Active", "EXPIRED", "Expired", "Revoked", "Suspended"])
    .optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  logoUrl: z.string().optional(),
  applicantPhotoUrl: z.string().optional(),
});
