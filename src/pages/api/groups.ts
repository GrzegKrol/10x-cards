import type { APIRoute } from "astro";
import { GroupService } from "@/lib/services/group.service";
import { GroupsListQuerySchema, CreateGroupSchema } from "@/lib/schemas/groups.schema";
import { ERROR_MESSAGES, HTTP_HEADERS } from "@/lib/constants";
import { createErrorResponse, handleValidationError } from "@/lib/utils";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const result = GroupsListQuerySchema.safeParse(queryParams);

    if (!result.success) {
      return handleValidationError(result.error);
    }

    const groupService = new GroupService(locals.supabase);
    const response = await groupService.getGroups(result.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching groups:", error);

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

    const result = CreateGroupSchema.safeParse(body);

    if (!result.success) {
      return handleValidationError(result.error);
    }

    // Create group using service
    const groupService = new GroupService(locals.supabase);
    const group = await groupService.createGroup(result.data);

    return new Response(JSON.stringify(group), {
      status: 201,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error creating group:", error);

    if (error instanceof Error && error.message === ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, "User not authenticated", 401);
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
