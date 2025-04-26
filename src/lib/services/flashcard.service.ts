import type { SupabaseClient } from "@/db/supabase.client";
import type { FlashcardDTO, FlashcardsListDTO, CreateFlashcardCommand, UpdateFlashcardCommand } from "@/types";
import type { FlashcardsListQuery } from "@/lib/schemas/flashcards.schema";
import { DB_TABLES, ERROR_MESSAGES } from "@/lib/constants";
import { getUserIdFromSession } from "@/lib/utils";

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getFlashcards(query: FlashcardsListQuery): Promise<FlashcardsListDTO> {
    const userId = await getUserIdFromSession(this.supabase);

    // Calculate pagination
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;

    // Create base query with required filters
    const baseQuery = this.supabase
      .from(DB_TABLES.FLASHCARD)
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("group_id", query.group_id);

    // Apply optional source filter
    if (query.source) {
      baseQuery.eq("source", query.source);
    }

    // Execute query with sorting and pagination
    const data = await baseQuery.order(query.sort, { ascending: query.order === "asc" }).range(from, to);

    if (data.error) {
      throw new Error(`Failed to fetch flashcards: ${data.error.message}`);
    }

    return {
      data: data.data as FlashcardDTO[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: data.count || 0,
      },
    };
  }

  async getFlashcard(flashcardId: string): Promise<FlashcardDTO> {
    const userId = await getUserIdFromSession(this.supabase);

    const result = await this.supabase
      .from(DB_TABLES.FLASHCARD)
      .select()
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (result.error) {
      throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    return result.data;
  }

  async createFlashcard(data: CreateFlashcardCommand): Promise<FlashcardDTO> {
    const userId = await getUserIdFromSession(this.supabase);

    const result = await this.supabase
      .from(DB_TABLES.FLASHCARD)
      .insert([
        {
          front: data.front,
          back: data.back,
          group_id: data.group_id,
          user_id: userId,
          source: "manual" as const,
          is_approved: true,
        },
      ])
      .select()
      .single();

    if (result.error) {
      if (result.error.code === "23503") {
        throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
      }
      throw new Error(`${ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED}: ${result.error.message}`);
    }

    if (!result.data) {
      throw new Error(ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED);
    }

    return result.data;
  }

  async updateFlashcard(flashcardId: string, data: UpdateFlashcardCommand): Promise<FlashcardDTO> {
    const userId = await getUserIdFromSession(this.supabase);

    const result = await this.supabase
      .from(DB_TABLES.FLASHCARD)
      .update({
        front: data.front,
        back: data.back,
        is_approved: data.is_approved,
        updated_date: new Date().toISOString(),
      })
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .select()
      .single();

    if (result.error) {
      throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    return result.data;
  }

  async deleteFlashcard(flashcardId: string): Promise<void> {
    const userId = await getUserIdFromSession(this.supabase);

    const { error } = await this.supabase
      .from(DB_TABLES.FLASHCARD)
      .delete()
      .eq("id", flashcardId)
      .eq("user_id", userId);

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(ERROR_MESSAGES.FLASHCARD_NOT_FOUND);
      }
      throw new Error(ERROR_MESSAGES.DELETE_FLASHCARD_FAILED);
    }
  }

  async deleteGroupFlashcards(groupId: string): Promise<void> {
    const userId = await getUserIdFromSession(this.supabase);

    const { error } = await this.supabase
      .from(DB_TABLES.FLASHCARD)
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) {
      if (error.code === "23503") {
        throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
      }
      throw new Error(ERROR_MESSAGES.DELETE_FLASHCARD_FAILED);
    }
  }
}
