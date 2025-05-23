import type { APIRoute } from "astro";
import { GroupService } from "@/lib/services/group.service";
import { GroupIdSchema, UpdateGroupSchema } from "@/lib/schemas/groups.schema";
import { ERROR_MESSAGES, HTTP_HEADERS } from "@/lib/constants";
import { createErrorResponse, handleValidationError } from "@/lib/utils";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Validate group ID
    const result = GroupIdSchema.safeParse({ id: params.groupId });

    if (!result.success) {
      return handleValidationError(result.error);
    }

    // Fetch group using service
    const groupService = new GroupService(locals.supabase);
    const group = await groupService.getGroup(result.data.id);

    return new Response(JSON.stringify(group), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching group:", error);

    if (error instanceof Error && error.message === ERROR_MESSAGES.GROUP_NOT_FOUND) {
      return createErrorResponse(ERROR_MESSAGES.GROUP_NOT_FOUND, undefined, 404);
    }

    if (error instanceof Error && error.message === ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, "User not authenticated", 401);
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    // Validate groupId
    const idResult = GroupIdSchema.safeParse({ id: params.groupId });
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

    const result = UpdateGroupSchema.safeParse(body);
    if (!result.success) {
      return handleValidationError(result.error);
    }

    // Update group using service
    const groupService = new GroupService(locals.supabase);
    const group = await groupService.updateGroup(idResult.data.id, result.data);

    return new Response(JSON.stringify(group), {
      status: 200,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error updating group:", error);

    if (error instanceof Error && error.message === ERROR_MESSAGES.GROUP_NOT_FOUND) {
      return createErrorResponse(ERROR_MESSAGES.GROUP_NOT_FOUND, undefined, 404);
    }

    if (error instanceof Error && error.message === ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, "User not authenticated", 401);
    }

    return createErrorResponse(
      ERROR_MESSAGES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
