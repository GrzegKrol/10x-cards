import type { APIRoute } from "astro";
import { GroupService } from "@/lib/services/group.service";
import { GroupsListQuerySchema, CreateGroupSchema } from "@/lib/schemas/groups.schema";
import { ERROR_MESSAGES, HTTP_HEADERS } from "@/lib/constants";
import { DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";
import { createErrorResponse, handleValidationError } from "@/lib/utils";

export const prerender = false;

// Initialize service at module level with empty supabase client
const groupService = new GroupService({} as SupabaseClient);

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Update service with current supabase instance
    groupService.setSupabase(locals.supabase);

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const result = GroupsListQuerySchema.safeParse(queryParams);

    if (!result.success) {
      return handleValidationError(result.error);
    }

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
    // Update service with current supabase instance
    groupService.setSupabase(locals.supabase);

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
