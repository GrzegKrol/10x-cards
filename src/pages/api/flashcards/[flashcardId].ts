import type { APIRoute } from "astro";
import { FlashcardService } from "@/lib/services/flashcard.service";
import { FlashcardIdSchema, UpdateFlashcardSchema } from "@/lib/schemas/flashcards.schema";
import { ERROR_MESSAGES, HTTP_HEADERS } from "@/lib/constants";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { createErrorResponse, handleValidationError } from "@/lib/utils";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Validate flashcard ID
    const result = FlashcardIdSchema.safeParse({ id: params.flashcardId });

    if (!result.success) {
      return handleValidationError(result.error);
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard = await flashcardService.getFlashcard(result.data.id, DEFAULT_USER_ID);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching flashcard:", error);

    if (error instanceof Error && error.message === ERROR_MESSAGES.GROUP_NOT_FOUND) {
      return createErrorResponse("Flashcard not found", undefined, 404);
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    // Validate flashcard ID
    const idResult = FlashcardIdSchema.safeParse({ id: params.flashcardId });
    if (!idResult.success) {
      return handleValidationError(idResult.error);
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body", undefined, 400);
    }

    const result = UpdateFlashcardSchema.safeParse(body);
    if (!result.success) {
      return handleValidationError(result.error);
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard = await flashcardService.updateFlashcard(idResult.data.id, result.data, DEFAULT_USER_ID);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error updating flashcard:", error);

    if (error instanceof Error && error.message === ERROR_MESSAGES.GROUP_NOT_FOUND) {
      return createErrorResponse("Flashcard not found", undefined, 404);
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { flashcardId } = params;

    if (!flashcardId) {
      return createErrorResponse("Flashcard ID is required", undefined, 400);
    }

    const flashcardService = new FlashcardService(locals.supabase);
    await flashcardService.deleteFlashcard(flashcardId, DEFAULT_USER_ID);

    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error deleting flashcard:", error);

    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.FLASHCARD_NOT_FOUND) {
        return createErrorResponse(ERROR_MESSAGES.FLASHCARD_NOT_FOUND, undefined, 404);
      }
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
