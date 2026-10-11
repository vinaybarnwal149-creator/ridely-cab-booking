import { AppError } from "../errors";

/**
 * Generate a 4-digit numeric OTP (e.g. "4829")
 */
export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Verify rider OTP with attempt protection (max 5 attempts)
 */
export function verifyOtp(
  inputOtp: string,
  expectedOtp: string,
  currentAttempts: number
): { success: boolean; attemptsLeft: number } {
  const maxAttempts = 5;
  if (currentAttempts >= maxAttempts) {
    throw new AppError(
      "OTP_INVALID",
      422,
      "Maximum OTP verification attempts exceeded. Ride flagged for security.",
      { attemptsLeft: 0 }
    );
  }

  const success = inputOtp.trim() === expectedOtp.trim();
  const attemptsLeft = maxAttempts - (currentAttempts + 1);

  if (!success) {
    throw new AppError(
      "OTP_INVALID",
      422,
      "That code does not match. Ask the rider to check their app.",
      { attemptsLeft }
    );
  }

  return { success: true, attemptsLeft };
}

