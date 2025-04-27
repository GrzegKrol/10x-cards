import { ERROR_MESSAGES } from "./constants";
import type { ZodError } from "zod";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleValidationError(error: ZodError) {
  return new Response(
    JSON.stringify({
      error: ERROR_MESSAGES.VALIDATION_FAILED,
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export function createErrorResponse(error: string, details?: string, status = 500) {
  return new Response(
    JSON.stringify({
      error,
      ...(details && { message: details }),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
