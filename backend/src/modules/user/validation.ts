import { body } from "express-validator";

export const registerValidation = [
  // Email is now the primary identifier instead of username
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),

  body("fullName")
    .isString()
    .withMessage("Full name must be a string")
    .notEmpty()
    .withMessage("Full name is required")
    .trim(),

  body("phone")
    .isString()
    .withMessage("Phone must be a string")
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^[0-9+]+$/)
    .withMessage("Invalid phone number format"),

  // Fayda ID added for identity verification
  body("faydaId")
    .isString()
    .withMessage("Fayda ID must be a string")
    .isLength({ min: 12 })
    .withMessage("Fayda ID must be at least 12 characters"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("addressId")
    .optional()
    .isInt()
    .withMessage("Address ID must be an integer"),

  /* 
    ===========================================================
    FAYDA OTP VALIDATION (COMMENTED FOR LATER)
    ===========================================================
    body("otp")
      .if(body("faydaId").exists())
      .notEmpty()
      .withMessage("OTP is required for Fayda ID verification")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  */
];


export const loginValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];