export type RenewalErrorCode =
  | "CERTIFICATE_NOT_FOUND"
  | "CERTIFICATE_NOT_LINKED"
  | "NO_ORGANIZATION"
  | "CERTIFICATE_NOT_OWNED"
  | "ORGANIZATION_INACTIVE"
  | "CERTIFICATE_INACTIVE"
  | "RENEWAL_TOO_EARLY"
  | "RENEWAL_ALREADY_SUBMITTED"
  | "AUTHENTICATION_REQUIRED";

export class RenewalValidationError extends Error {
  readonly code: RenewalErrorCode;
  readonly statusCode: number;

  constructor(code: RenewalErrorCode, message: string, statusCode = 400) {
    super(message);
    this.name = "RenewalValidationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const isRenewalValidationError = (
  error: unknown,
): error is RenewalValidationError =>
  error instanceof RenewalValidationError;
