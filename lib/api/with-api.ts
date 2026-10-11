import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "../errors";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function successResponse<T>(data: T, meta?: ApiResponse["meta"]): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    ok: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status: statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof AppError) {
    return errorResponse(error.statusCode, error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return errorResponse(400, "VALIDATION_ERROR", "Validation failed", error.flatten().fieldErrors);
  }

  console.error("Unhandled API Error:", error);
  return errorResponse(500, "INTERNAL", "An unexpected error occurred. Please try again.");
}

