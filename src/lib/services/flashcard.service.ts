import { ERROR_MESSAGES } from "@/lib/constants";
import type { SupabaseClient } from "@/db/supabase.client";
import type {
  CreateFlashcardCommand,
  FlashcardDTO,
  FlashcardsListDTO,
  FlashcardsListQuery,
  UpdateFlashcardCommand,
} from "@/types";

export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  async getFlashcards(query: FlashcardsListQuery): Promise<FlashcardsListDTO> {
    const userId = await this.supabase.getUserIdFromSession();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let baseQuery = this.supabase.from("flashcard").select("*", { count: "exact" }).eq("user_id", userId);

    if (query.group_id) {
      baseQuery = baseQuery.eq("group_id", query.group_id);
    }

    if (query.source) {
      baseQuery = baseQuery.eq("source", query.source);
    }

    if (query.is_approved !== undefined) {
      baseQuery = baseQuery.eq("is_approved", query.is_approved);
    }

    try {
      const {
        data: flashcards,
        count,
        error,
      } = await baseQuery.order(query.sort || "created_at", { ascending: query.order === "asc" }).range(from, to);

      if (error) {
        throw new Error(ERROR_MESSAGES.FETCH_FLASHCARDS_FAILED);
      }

      return {
        data: flashcards,
        pagination: {
          page,
          limit,
          total: count || 0,
        },
      };
    } catch {
      throw new Error(ERROR_MESSAGES.FETCH_FLASHCARDS_FAILED);
    }
  }

  async createFlashcard(data: CreateFlashcardCommand): Promise<FlashcardDTO> {
    const userId = await this.supabase.getUserIdFromSession();

    const { data: flashcard, error } = await this.supabase
      .from("flashcard")
      .insert({
        ...data,
        source: "manual",
        user_id: userId,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23503") {
        throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
      }
      throw new Error(ERROR_MESSAGES.CREATE_FLASHCARD_FAILED);
    }

    return flashcard;
  }

  async updateFlashcard(flashcardId: string, data: UpdateFlashcardCommand): Promise<FlashcardDTO> {
    const userId = await this.supabase.getUserIdFromSession();

    const { data: flashcard, error } = await this.supabase
      .from("flashcard")
      .update({
        ...data,
        updated_date: new Date().toISOString(),
      })
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(ERROR_MESSAGES.FLASHCARD_NOT_FOUND);
      }
      throw new Error(ERROR_MESSAGES.UPDATE_FLASHCARD_FAILED);
    }

    return flashcard;
  }

  async deleteFlashcard(flashcardId: string): Promise<void> {
    const userId = await this.supabase.getUserIdFromSession();

    const { error } = await this.supabase.from("flashcard").delete().eq("id", flashcardId).eq("user_id", userId);

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(ERROR_MESSAGES.FLASHCARD_NOT_FOUND);
      }
      throw new Error(ERROR_MESSAGES.DELETE_FLASHCARD_FAILED);
    }
  }
}
