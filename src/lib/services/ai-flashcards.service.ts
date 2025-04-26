import type { SupabaseClient } from "@/db/supabase.client";
import type { AICreateFlashcardCommand, FlashcardDTO } from "@/types";
import { OpenRouterService } from "./openrouter.service";
import { DB_TABLES, ERROR_MESSAGES } from "@/lib/constants";
import { getUserIdFromSession } from "@/lib/utils";

export class AIFlashcardsService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly openRouter: OpenRouterService
  ) {}

  async generateFlashcards(command: Omit<AICreateFlashcardCommand, "user_id">): Promise<FlashcardDTO[]> {
    const userId = await getUserIdFromSession(this.supabase);

    // Verify group exists and user has access
    const { data: group, error: groupError } = await this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .select("id")
      .eq("id", command.group_id)
      .eq("user_id", userId)
      .single();

    if (groupError || !group) {
      throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    // Generate flashcards using AI
    const generatedCards = await this.openRouter.generateFlashcards(command.prompt, command.cards_count);

    // Save generated flashcards to database
    const now = new Date().toISOString();
    const { data: flashcards, error: insertError } = await this.supabase
      .from(DB_TABLES.FLASHCARD)
      .insert(
        generatedCards.map((card) => ({
          front: card.front,
          back: card.back,
          group_id: command.group_id,
          user_id: userId,
          source: "ai" as const,
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
        last_used_cards_count: command.cards_count,
        updated_date: now,
      })
      .eq("id", command.group_id)
      .eq("user_id", userId);

    if (updateError) {
      // Log error but don't fail the request as this is not critical
      // TODO: Implement proper error logging
      // eslint-disable-next-line no-console
      console.error("Failed to update group metadata:", updateError);
    }

    return flashcards;
  }
}
