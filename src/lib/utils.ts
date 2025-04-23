import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ERROR_MESSAGES, HTTP_HEADERS } from "./constants";
import type { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createErrorResponse(
  error: string,
  details?: { field: string; message: string }[] | string,
  status = 500
): Response {
  return new Response(
    JSON.stringify({
      error,
      ...(details && { details }),
    }),
    {
      status,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    }
  );
}

export function handleValidationError(error: ZodError): Response {
  return createErrorResponse(
    ERROR_MESSAGES.VALIDATION_FAILED,
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
    400
  );
}
