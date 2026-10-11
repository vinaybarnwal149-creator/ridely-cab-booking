export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "ACCOUNT_SUSPENDED"
  | "DRIVER_NOT_APPROVED"
  | "NOT_FOUND"
  | "INVALID_TRANSITION"
  | "RIDE_UNAVAILABLE"
  | "ACTIVE_RIDE_EXISTS"
  | "QUOTE_EXPIRED"
  | "UNPAID_RIDE"
  | "OUT_OF_SERVICE_AREA"
  | "PROMO_INVALID"
  | "PROMO_EXPIRED"
  | "OTP_INVALID"
  | "NO_ROUTE"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

