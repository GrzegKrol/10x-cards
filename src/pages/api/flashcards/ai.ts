import type { APIRoute } from "astro";
import { AIFlashcardsRequestSchema } from "@/lib/schemas/ai-flashcards.schema";
import { AIFlashcardsService } from "@/lib/services/ai-flashcards.service";
import { OpenRouterService } from "@/lib/services/openrouter.service";
import { ERROR_MESSAGES, HTTP_HEADERS } from "@/lib/constants";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!import.meta.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured");
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
        }
      );
    }

    const result = AIFlashcardsRequestSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: ERROR_MESSAGES.VALIDATION_FAILED,
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        }),
        {
          status: 400,
          headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
        }
      );
    }

    // Initialize services just before usage
    const openRouter = new OpenRouterService(import.meta.env.OPENROUTER_API_KEY);
    const aiFlashcardsService = new AIFlashcardsService(locals.supabase, openRouter);
    const flashcards = await aiFlashcardsService.generateFlashcards(result.data);

    return new Response(JSON.stringify({ flashcards }), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // TODO: Implement proper error logging
    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.GROUP_NOT_FOUND) {
        return new Response(JSON.stringify({ error: ERROR_MESSAGES.GROUP_NOT_FOUND }), {
          status: 404,
          headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
        });
      }

      if (error.message.includes(ERROR_MESSAGES.OPENROUTER_ERROR)) {
        return new Response(
          JSON.stringify({
            error: ERROR_MESSAGES.INTERNAL_ERROR,
            message: "AI service error. Please try again later.",
          }),
          {
            status: 503,
            headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
          }
        );
      }

      if (error.message === ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
        return new Response(
          JSON.stringify({
            error: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
            message: "User not authenticated",
          }),
          {
            status: 401,
            headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
      }
    );
  }
};
