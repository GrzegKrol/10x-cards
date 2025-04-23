import type { APIRoute } from "astro";
import { GroupService } from "@/lib/services/group.service";
import { GroupsListQuerySchema, CreateGroupSchema } from "@/lib/schemas/groups.schema";
import { ERROR_MESSAGES, HTTP_HEADERS } from "@/lib/constants";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
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
    const response = await groupService.getGroups(result.data, DEFAULT_USER_ID);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching groups:", error);

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
    const group = await groupService.createGroup(result.data, DEFAULT_USER_ID);

    return new Response(JSON.stringify(group), {
      status: 201,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error creating group:", error);

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
