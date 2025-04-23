import type { SupabaseClient } from "@/db/supabase.client";
import type { FlashcardGroupDTO, GroupsListDTO } from "@/types";
import type { GroupsListQuery, CreateGroupRequest, UpdateGroupRequest } from "@/lib/schemas/groups.schema";
import { DB_TABLES, ERROR_MESSAGES } from "@/lib/constants";

export class GroupService {
  constructor(private supabase: SupabaseClient) {}

  setSupabase(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getGroups(query: GroupsListQuery, userId: string): Promise<GroupsListDTO> {
    // Calculate pagination
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;

    // Create base query
    const baseQuery = this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    // Apply sorting
    const data = await baseQuery.order(query.sort, { ascending: query.order === "asc" }).range(from, to);

    if (data.error) {
      throw new Error(`Failed to fetch groups: ${data.error.message}`);
    }

    return {
      data: data.data as FlashcardGroupDTO[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: data.count || 0,
      },
    };
  }

  async createGroup(data: CreateGroupRequest, userId: string): Promise<FlashcardGroupDTO> {
    const result = await this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .insert([
        {
          name: data.name,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (result.error) {
      throw new Error(`${ERROR_MESSAGES.SAVE_GROUP_FAILED}: ${result.error.message}`);
    }

    if (!result.data) {
      throw new Error(ERROR_MESSAGES.SAVE_GROUP_FAILED);
    }

    return result.data;
  }

  async getGroup(groupId: string, userId: string): Promise<FlashcardGroupDTO> {
    const result = await this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .select()
      .eq("id", groupId)
      .eq("user_id", userId)
      .single();

    if (result.error) {
      throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    return result.data;
  }

  async updateGroup(groupId: string, data: UpdateGroupRequest, userId: string): Promise<FlashcardGroupDTO> {
    const result = await this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .update({
        name: data.name,
        ...(data.last_used_prompt && { last_used_prompt: data.last_used_prompt }),
        ...(typeof data.last_used_cards_count === "number" && { last_used_cards_count: data.last_used_cards_count }),
        updated_date: new Date().toISOString(),
      })
      .eq("id", groupId)
      .eq("user_id", userId)
      .select()
      .single();

    if (result.error) {
      throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    return result.data;
  }
}
