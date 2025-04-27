import { describe, expect, it, vi, beforeEach } from "vitest";
import { AIFlashcardsService } from "../ai-flashcards.service";
import { OpenRouterService } from "../openrouter.service";
import { ERROR_MESSAGES } from "@/lib/constants";
import type { SupabaseClient } from "@/db/supabase.client";
import type { FlashcardAI } from "@/types";

describe("AIFlashcardsService", () => {
  let service: AIFlashcardsService;
  let mockSupabase: SupabaseClient;
  let mockOpenRouter: OpenRouterService;

  beforeEach(() => {
    mockSupabase = {
      getUserIdFromSession: vi.fn(),
      from: vi.fn(),
    } as unknown as SupabaseClient;

    mockOpenRouter = {
      generateFlashcards: vi.fn(),
    } as unknown as OpenRouterService;

    service = new AIFlashcardsService(mockSupabase, mockOpenRouter);
  });

  describe("generateFlashcards", () => {
    const mockUserId = "test-user-id";
    const mockCommand = {
      group_id: "test-group-id",
      prompt: "Test prompt",
      cards_count: 3,
    };

    const mockGeneratedFlashcards: FlashcardAI[] = [
      { front: "Question 1", back: "Answer 1" },
      { front: "Question 2", back: "Answer 2" },
      { front: "Question 3", back: "Answer 3" },
    ];

    const mockSavedFlashcards: FlashcardAI[] = mockGeneratedFlashcards.map((card, index) => ({
      ...card,
      id: `card-${index + 1}`,
      group_id: mockCommand.group_id,
      user_id: mockUserId,
      source: "ai" as const,
      is_approved: false,
      creation_date: expect.any(String),
      updated_date: expect.any(String),
    }));

    it("should generate and save flashcards successfully", async () => {
      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockCommand.group_id },
              error: null,
            }),
          }),
        }),
      });

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockSavedFlashcards,
          error: null,
        }),
      });

      vi.spyOn(mockSupabase, "from").mockImplementation(() => ({
        select: selectMock,
        insert: insertMock,
      }));

      vi.spyOn(mockOpenRouter, "generateFlashcards").mockResolvedValue(mockGeneratedFlashcards);

      const result = await service.generateFlashcards(mockCommand);

      expect(result).toEqual(mockSavedFlashcards);
      expect(mockOpenRouter.generateFlashcards).toHaveBeenCalledWith(mockCommand.prompt, mockCommand.cards_count);
    });

    it("should throw error when group is not found", async () => {
      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Group not found" },
            }),
          }),
        }),
      });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        select: selectMock,
      } as unknown as ReturnType<SupabaseClient["from"]>);

      await expect(service.generateFlashcards(mockCommand)).rejects.toThrow(ERROR_MESSAGES.GROUP_NOT_FOUND);
    });

    it("should throw error when OpenRouter service fails", async () => {
      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockCommand.group_id },
              error: null,
            }),
          }),
        }),
      });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        select: selectMock,
      } as unknown as ReturnType<SupabaseClient["from"]>);

      vi.spyOn(mockOpenRouter, "generateFlashcards").mockRejectedValue(new Error(ERROR_MESSAGES.OPENROUTER_ERROR));

      await expect(service.generateFlashcards(mockCommand)).rejects.toThrow(ERROR_MESSAGES.OPENROUTER_ERROR);
    });

    it("should throw error when saving flashcards fails", async () => {
      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockCommand.group_id },
              error: null,
            }),
          }),
        }),
      });

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
        }),
      });

      vi.spyOn(mockSupabase, "from").mockImplementation(() => ({
        select: selectMock,
        insert: insertMock,
      }));

      vi.spyOn(mockOpenRouter, "generateFlashcards").mockResolvedValue(mockGeneratedFlashcards);

      await expect(service.generateFlashcards(mockCommand)).rejects.toThrow(ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED);
    });
  });
});
