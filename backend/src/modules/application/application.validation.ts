// filepath: src/modules/application/application.validation.ts
import { z } from "zod";

export const createApplicationSchema = z.object({
  formData: z.object({
    // Steps 1 & 2: Agency & Location
    agencyName: z.string().min(3, "Agency name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    tinNumber: z.string().min(5, "TIN number is required"),
    kebele: z.string().min(1, "Kebele is required"),
    houseNumber: z.string().min(1, "House number is required"),
    specialLocation: z.string().optional().nullable(),
    branchAddresses: z
      .array(
        z.object({
          kebeleId: z.preprocess(
            (val: unknown) => Number(val),
            z.number().int().positive("Branch kebele is required"),
          ),
          houseNumber: z.string().optional().nullable(),
          specialLocation: z.string().optional().nullable(),
        }),
      )
      .optional()
      .default([]),

    // Step 3: Resource Tracking
    numberOfOffices: z.preprocess(
      (val: unknown) => Number(val),
      z.number().min(1, "At least one office is required"),
    ),
    numberOfComputers: z.preprocess(
      (val: unknown) => Number(val),
      z.number().min(0, "Must be 0 or more"),
    ),
    numberOfVehicles: z.preprocess(
      (val: unknown) => Number(val),
      z.number().min(0, "Must be 0 or more"),
    ),
    hasStoreHouse: z.preprocess(
      (val: unknown) => val === "Yes" || val === true,
      z.boolean(),
    ),
    capitalAmount: z.preprocess(
      (val: unknown) => Number(val),
      z.number().min(0, "Capital amount is required"),
    ),

    // Step 4: Training Details
    trainingAddress: z.string().min(5, "Training address is required"),
    trainingDays: z.preprocess(
      (val: unknown) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
    trainingProvider: z.string().min(3, "Training provider name is required"),

    // Step 5: Full Personnel Objects
    manager: z
      .object({
        fullName: z.string().min(3, "Manager full name is required"),
        gender: z.string().min(1, "Manager gender is required"),
        citizenship: z.string().min(2, "Manager citizenship is required"),
        email: z.string().email("Invalid manager email"),
        phone: z.string().min(10, "Invalid manager phone"),
        faydaId: z.string().min(1, "Manager Fayda ID is required"),
        otp: z.string().optional(),
        region: z.string().min(1, "Manager region is required"),
        zone: z.string().min(1, "Manager zone is required"),
        woreda: z.string().min(1, "Manager woreda is required"),
        kebele: z.string().min(1, "Manager kebele is required"),
        houseNo: z.string().min(1, "Manager house number is required"),
        specialLocation: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),

    ops: z
      .object({
        fullName: z.string().min(3, "Ops head full name is required"),
        gender: z.string().min(1, "Ops head gender is required"),
        citizenship: z.string().min(2, "Ops head citizenship is required"),
        email: z.string().email("Invalid ops head email"),
        phone: z.string().min(10, "Invalid ops head phone"),
        faydaId: z.string().min(1, "Ops head Fayda ID is required"),
        otp: z.string().optional(),
        region: z.string().min(1, "Ops head region is required"),
        zone: z.string().min(1, "Ops head zone is required"),
        woreda: z.string().min(1, "Ops head woreda is required"),
        kebele: z.string().min(1, "Ops head kebele is required"),
        houseNo: z.string().min(1, "Ops head house number is required"),
        specialLocation: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),

    admin: z
      .object({
        fullName: z.string().min(3, "Admin head full name is required"),
        gender: z.string().min(1, "Admin head gender is required"),
        citizenship: z.string().min(2, "Admin head citizenship is required"),
        email: z.string().email("Invalid admin head email"),
        phone: z.string().min(10, "Invalid admin head phone"),
        faydaId: z.string().min(1, "Admin head Fayda ID is required"),
        otp: z.string().optional(),
        region: z.string().min(1, "Admin head region is required"),
        zone: z.string().min(1, "Admin head zone is required"),
        woreda: z.string().min(1, "Admin head woreda is required"),
        kebele: z.string().min(1, "Admin head kebele is required"),
        houseNo: z.string().min(1, "Admin head house number is required"),
        specialLocation: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
  }),

  uploadedFiles: z.record(z.string(), z.string().url()).refine(
    (files: Record<string, string>) => {
      const mandatory = [
        // Organization Assets & Docs
        "logo",
        "trade_license",
        "tin_paper",
        "articles",
        "capital",
        "vehicle_rent",
        "house_rent",
        "employment_form",
        "warranty_form",
        "id_sample",
        "uniform_sample",

        // Training Docs
        "training_manual",

        // Personnel Specific Docs (Required for the RegisterPersonnel logic)
        "manager_edu_doc",
        "manager_id_doc",
        "ops_edu_doc",
        "ops_id_doc",
        "admin_edu_doc",
        "admin_id_doc",
      ];

      return mandatory.every((key) => !!files[key]);
    },
    {
      message:
        "Missing required files. Please ensure all Organization documents, Photo samples, the Training Manual, and Personnel (Education/ID) documents are uploaded.",
    },
  ),
});
