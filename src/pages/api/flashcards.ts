import type { APIRoute } from "astro";
import { FlashcardService } from "@/lib/services/flashcard.service";
import { FlashcardsListQuerySchema, CreateFlashcardSchema } from "@/lib/schemas/flashcards.schema";
import { ERROR_MESSAGES, HTTP_HEADERS } from "@/lib/constants";
import { createErrorResponse, handleValidationError } from "@/lib/utils";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const result = FlashcardsListQuerySchema.safeParse(queryParams);

    if (!result.success) {
      return handleValidationError(result.error);
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const response = await flashcardService.getFlashcards(result.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching flashcards:", error);

    if (error instanceof Error && error.message === ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, "User not authenticated", 401);
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body", undefined, 400);
    }

    const result = CreateFlashcardSchema.safeParse(body);

    if (!result.success) {
      return handleValidationError(result.error);
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard = await flashcardService.createFlashcard(result.data);

    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error creating flashcard:", error);

    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.GROUP_NOT_FOUND) {
        return createErrorResponse(ERROR_MESSAGES.GROUP_NOT_FOUND, undefined, 404);
      }

      if (error.message === ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
        return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, "User not authenticated", 401);
      }

      if (error.message.includes(ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED)) {
        return createErrorResponse(ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED, error.message, 500);
      }
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
