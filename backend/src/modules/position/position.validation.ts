// filepath: backend/src/modules/position/position.validation.ts
import { z } from "zod";

export const createPositionSchema = z.object({
  name: z
    .string()
    .min(2, "Position name must be at least 2 characters")
    .max(100),
  requirements: z
    .array(
      z.object({
        level: z.number().int().positive().nullable().optional(),
        minimumExperienceYears: z.number().nonnegative().nullable().optional(),
        requiredEducationLevel: z.string().max(100).nullable().optional(),
        requiredWorkExperienceYears: z
          .number()
          .nonnegative()
          .nullable()
          .optional(),
      }),
    )
    .nullable()
    .optional(), // Multiple requirement rows can be attached to one position
});

export const updatePositionSchema = createPositionSchema;

export const assignEmployeeSchema = z.object({
  employeeId: z.number().int().positive(),
  positionId: z.number().int().positive(),
});
