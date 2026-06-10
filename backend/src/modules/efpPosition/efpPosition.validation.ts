import { z } from "zod";

export const createEfpPositionSchema = z.object({
  nameEnglish: z
    .string()
    .min(2, "English name must be at least 2 characters")
    .max(100),
  nameAmharic: z
    .string()
    .min(2, "Amharic name must be at least 2 characters")
    .max(100),
});

export const updateEfpPositionSchema = createEfpPositionSchema;
