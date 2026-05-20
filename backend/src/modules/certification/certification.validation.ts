// filepath: backend/src/modules/certification/certification.validation.ts
import { z } from "zod";

export const issueCertSchema = z.object({
  applicationId: z.number().int().positive(),
  organizationId: z.number().int().positive(),
  level: z.string().optional().default("Standard"),
});

export const updateCertStatusSchema = z.object({
  status: z.enum(["Active", "Expired", "Revoked", "Suspended"]),
});

export const updateCertSchema = z.object({
  level: z.string().optional(),
  logoUrl: z.string().optional(),
  applicantPhotoUrl: z.string().optional(),
});
