// filepath: backend/src/modules/position/position.validation.ts
import { z } from "zod";

export const createPositionSchema = z.object({
  name: z
    .string()
    .min(2, "Position name must be at least 2 characters")
    .max(100),
  requirements: z
    .object({
      minimumExperienceYears: z.number().nonnegative().nullable().optional(),
      requiredEducationLevel: z.string().max(100).nullable().optional(),
      requiredExperienceField: z.string().max(255).nullable().optional(),
    })
    .nullable()
    .optional(), // Requirements are optional based on your schema
});

export const updatePositionSchema = createPositionSchema;

export const assignEmployeeSchema = z.object({
  employeeId: z.number().int().positive(),
  positionId: z.number().int().positive(),
});
