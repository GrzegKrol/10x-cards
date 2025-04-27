import { describe, expect, it, vi, beforeEach } from "vitest";
import { AIFlashcardsService } from "../ai-flashcards.service";
import { OpenRouterService } from "../openrouter.service";
import { ERROR_MESSAGES } from "@/lib/constants";

import type { SupabaseClient } from "@/db/supabase.client";

vi.mock("@/db/database.types", () => ({
  DB_TABLES: {
    FLASHCARD_GROUP: "flashcard_group",
    FLASHCARD: "flashcard",
  },
}));

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
    it("should generate and save AI flashcards successfully", async () => {
      const mockUserId = "test-user-id";
      const mockGroupId = "group-1";
      const mockGeneratedCards = [
        { front: "AI Question 1", back: "AI Answer 1" },
        { front: "AI Question 2", back: "AI Answer 2" },
      ];
      const mockSavedCards = mockGeneratedCards.map((card, index) => ({
        ...card,
        id: `card-${index + 1}`,
        group_id: mockGroupId,
        user_id: mockUserId,
        source: "ai",
        is_approved: false,
        creation_date: expect.any(String),
        updated_date: expect.any(String),
      }));

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const singleForGroupMock = vi.fn().mockResolvedValue({
        data: { id: mockGroupId },
        error: null,
      });
      const eq2ForGroupMock = vi.fn().mockReturnValue({ single: singleForGroupMock });
      const eqForGroupMock = vi.fn().mockReturnValue({ eq: eq2ForGroupMock });
      const selectForGroupMock = vi.fn().mockReturnValue({ eq: eqForGroupMock });

      const selectForFlashcardMock = vi.fn().mockResolvedValue({
        data: mockSavedCards,
        error: null,
      });
      const insertForFlashcardMock = vi.fn().mockReturnValue({ select: selectForFlashcardMock });

      vi.spyOn(mockSupabase, "from").mockImplementation((table: string) => {
        if (table === "flashcard_group") {
          return { select: selectForGroupMock };
        }
        return { insert: insertForFlashcardMock };
      });

      vi.spyOn(mockOpenRouter, "generateFlashcards").mockResolvedValue(mockGeneratedCards);

      const result = await service.generateFlashcards({
        prompt: "Generate test flashcards",
        cards_count: 2,
        group_id: mockGroupId,
      });

      expect(result).toEqual(mockSavedCards);
    });

    it("should throw error when group not found", async () => {
      const mockUserId = "test-user-id";

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: new Error(ERROR_MESSAGES.GROUP_NOT_FOUND),
      });

      const eq2Mock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        select: selectMock,
      });

      await expect(
        service.generateFlashcards({
          prompt: "Generate test flashcards",
          cards_count: 2,
          group_id: "non-existent-group",
        })
      ).rejects.toThrow(ERROR_MESSAGES.GROUP_NOT_FOUND);
    });

    it("should throw error when AI generation fails", async () => {
      const mockUserId = "test-user-id";
      const mockGroupId = "group-1";

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const singleMock = vi.fn().mockResolvedValue({
        data: { id: mockGroupId },
        error: null,
      });

      const eq2Mock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        select: selectMock,
      });

      vi.spyOn(mockOpenRouter, "generateFlashcards").mockRejectedValue(new Error(ERROR_MESSAGES.OPENROUTER_ERROR));

      await expect(
        service.generateFlashcards({
          prompt: "Generate test flashcards",
          cards_count: 2,
          group_id: mockGroupId,
        })
      ).rejects.toThrow(ERROR_MESSAGES.OPENROUTER_ERROR);
    });

    it("should handle errors when saving generated flashcards", async () => {
      const mockUserId = "test-user-id";
      const mockGroupId = "group-1";
      const mockGeneratedCards = [{ front: "AI Question 1", back: "AI Answer 1" }];

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const singleForGroupMock = vi.fn().mockResolvedValue({
        data: { id: mockGroupId },
        error: null,
      });
      const eq2ForGroupMock = vi.fn().mockReturnValue({ single: singleForGroupMock });
      const eqForGroupMock = vi.fn().mockReturnValue({ eq: eq2ForGroupMock });
      const selectForGroupMock = vi.fn().mockReturnValue({ eq: eqForGroupMock });

      const selectForFlashcardMock = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });
      const insertForFlashcardMock = vi.fn().mockReturnValue({ select: selectForFlashcardMock });

      vi.spyOn(mockSupabase, "from").mockImplementation((table: string) => {
        if (table === "flashcard_group") {
          return { select: selectForGroupMock };
        }
        return { insert: insertForFlashcardMock };
      });

      vi.spyOn(mockOpenRouter, "generateFlashcards").mockResolvedValue(mockGeneratedCards);

      await expect(
        service.generateFlashcards({
          prompt: "Generate test flashcards",
          cards_count: 1,
          group_id: mockGroupId,
        })
      ).rejects.toThrow(ERROR_MESSAGES.SAVE_FLASHCARDS_FAILED);
    });
  });
});
