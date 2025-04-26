import type { APIRoute } from "astro";
import { FlashcardService } from "@/lib/services/flashcard.service";
import { ERROR_MESSAGES } from "@/lib/constants";
import { createErrorResponse } from "@/lib/utils";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { groupId } = params;

    if (!groupId) {
      return createErrorResponse("Group ID is required", undefined, 400);
    }

    const flashcardService = new FlashcardService(locals.supabase);
    await flashcardService.deleteGroupFlashcards(groupId);

    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error deleting flashcards:", error);

    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.GROUP_NOT_FOUND) {
        return createErrorResponse(ERROR_MESSAGES.GROUP_NOT_FOUND, undefined, 404);
      }

      if (error.message === ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
        return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, "User not authenticated", 401);
      }
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
