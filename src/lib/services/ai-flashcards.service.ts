import type { SupabaseClient } from "@/db/supabase.client";
import type { AICreateFlashcardCommand, FlashcardDTO } from "@/types";
import { OpenRouterService } from "./openrouter.service";
import { DB_TABLES, ERROR_MESSAGES } from "@/lib/constants";

export class AIFlashcardsService {
  constructor(
    private supabase: SupabaseClient,
    private openRouter: OpenRouterService
  ) {}

  async generateFlashcards(command: AICreateFlashcardCommand): Promise<FlashcardDTO[]> {
    // Verify group exists and user has access
    const { data: group, error: groupError } = await this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .select("id")
      .eq("id", command.groupId)
      .eq("user_id", command.userId)
      .single();

    if (groupError || !group) {
      throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    // Generate flashcards using AI
    const generatedCards = await this.openRouter.generateFlashcards(command.prompt, command.cardsCount);

    // Save generated flashcards to database
    const now = new Date().toISOString();
    const { data: flashcards, error: insertError } = await this.supabase
      .from(DB_TABLES.FLASHCARD)
      .insert(
        generatedCards.map((card) => ({
          front: card.front,
          back: card.back,
          group_id: command.groupId,
          user_id: command.userId,
          source: "ai",
          is_approved: false,
          creation_date: now,
          updated_date: now,
        }))
      )
      .select();

    if (insertError) {
      throw new Error(`${ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED}: ${insertError.message}`);
    }

    if (!flashcards) {
      throw new Error(ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED);
    }

    // Update group metadata
    const { error: updateError } = await this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .update({
        last_used_prompt: command.prompt,
        last_used_cards_count: command.cardsCount,
        updated_date: now,
      })
      .eq("id", command.groupId)
      .eq("user_id", command.userId);

    if (updateError) {
      // Log error but don't fail the request as this is not critical
      // TODO: Implement proper error logging
    }

    // Transform response to match DTO camelCase format
    return flashcards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      groupId: card.group_id,
      userId: card.user_id,
      source: card.source,
      isApproved: card.is_approved,
      creationDate: card.creation_date,
      updatedDate: card.updated_date,
    }));
  }
}
