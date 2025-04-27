import type { FlashcardAI, AICreateFlashcardCommand } from "@/types";
import { ERROR_MESSAGES, DB_TABLES } from "@/lib/constants";
import { OpenRouterService } from "./openrouter.service";
import type { SupabaseClient } from "@/db/supabase.client";

export class AIFlashcardsService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly openRouter: OpenRouterService
  ) {}

  async generateFlashcards(command: AICreateFlashcardCommand): Promise<FlashcardAI[]> {
    const userId = await this.supabase.getUserIdFromSession();

    // Check if group exists and belongs to user
    const { data: group, error: groupError } = await this.supabase
      .from(DB_TABLES.FLASHCARD_GROUP)
      .select("id")
      .eq("id", command.group_id)
      .eq("user_id", userId)
      .single();

    if (groupError || !group) {
      throw new Error(ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    try {
      // Generate flashcards using OpenRouter
      const generatedFlashcards = await this.openRouter.generateFlashcards(command.prompt, command.cards_count);

      // Save generated flashcards
      const flashcardDTOs = generatedFlashcards.map((card) => ({
        ...card,
        group_id: command.group_id,
        user_id: userId,
        source: "ai" as const,
        is_approved: false,
        creation_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      }));

      const { data: savedFlashcards, error: saveError } = await this.supabase
        .from(DB_TABLES.FLASHCARD)
        .insert(flashcardDTOs)
        .select("*");

      if (saveError || !savedFlashcards) {
        throw new Error(ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED);
      }

      return savedFlashcards;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.OPENROUTER_ERROR);
    }
  }
}
