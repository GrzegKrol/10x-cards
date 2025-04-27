import { describe, expect, it, vi, beforeEach } from "vitest";
import { FlashcardService } from "../flashcard.service";
import { ERROR_MESSAGES } from "@/lib/constants";
import type { SupabaseClient } from "@/db/supabase.client";

describe("FlashcardService", () => {
  let service: FlashcardService;
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    mockSupabase = {
      getUserIdFromSession: vi.fn(),
      from: vi.fn(),
    } as unknown as SupabaseClient;

    service = new FlashcardService(mockSupabase);
  });

  describe("getFlashcards", () => {
    it("should fetch flashcards with pagination and filtering", async () => {
      const mockUserId = "test-user-id";
      const mockFlashcards = [{ id: "1", front: "Question 1", back: "Answer 1", group_id: "group-1" }];
      const query = {
        page: 1,
        limit: 10,
        sort: "created_at",
        order: "desc" as const,
        group_id: "group-1",
        source: "manual" as const,
      };

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      // Setup the mock chain with proper method returns
      const rangeMock = vi.fn().mockResolvedValue({
        data: mockFlashcards,
        count: 1,
        error: null,
      });

      const orderMock = vi.fn().mockReturnValue({ range: rangeMock });
      const eq3Mock = vi.fn().mockReturnValue({ order: orderMock });
      const eq2Mock = vi.fn().mockReturnValue({ eq: eq3Mock });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        select: selectMock,
      });

      const result = await service.getFlashcards(query);

      expect(result).toEqual({
        data: mockFlashcards,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      });
    });
  });

  describe("createFlashcard", () => {
    it("should create a new flashcard successfully", async () => {
      const mockUserId = "test-user-id";
      const mockFlashcard = {
        id: "1",
        front: "Test Question",
        back: "Test Answer",
        group_id: "group-1",
      };

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const singleMock = vi.fn().mockResolvedValue({
        data: mockFlashcard,
        error: null,
      });

      const selectMock = vi.fn().mockReturnValue({ single: singleMock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: selectMock,
        }),
      });

      const result = await service.createFlashcard({
        front: "Test Question",
        back: "Test Answer",
        group_id: "group-1",
      });

      expect(result).toEqual(mockFlashcard);
    });

    it("should throw error when group not found", async () => {
      const mockUserId = "test-user-id";

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { code: "23503" },
      });

      const selectMock = vi.fn().mockReturnValue({ single: singleMock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: selectMock,
        }),
      });

      await expect(
        service.createFlashcard({
          front: "Test Question",
          back: "Test Answer",
          group_id: "non-existent-group",
        })
      ).rejects.toThrow(ERROR_MESSAGES.GROUP_NOT_FOUND);
    });
  });

  describe("deleteFlashcard", () => {
    it("should delete flashcard successfully", async () => {
      const mockUserId = "test-user-id";

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const eq2Mock = vi.fn().mockResolvedValue({ error: null });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      });

      await expect(service.deleteFlashcard("1")).resolves.not.toThrow();
    });

    it("should throw error when flashcard not found", async () => {
      const mockUserId = "test-user-id";

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const eq2Mock = vi.fn().mockResolvedValue({
        error: { code: "PGRST116" },
      });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      });

      await expect(service.deleteFlashcard("non-existent-id")).rejects.toThrow(ERROR_MESSAGES.FLASHCARD_NOT_FOUND);
    });
  });

  describe("updateFlashcard", () => {
    it("should update flashcard successfully", async () => {
      const mockUserId = "test-user-id";
      const mockFlashcard = {
        id: "1",
        front: "Updated Question",
        back: "Updated Answer",
        is_approved: true,
      };

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const singleMock = vi.fn().mockResolvedValue({
        data: mockFlashcard,
        error: null,
      });

      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eq2Mock = vi.fn().mockReturnValue({ select: selectMock });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      });

      const result = await service.updateFlashcard("1", {
        front: "Updated Question",
        back: "Updated Answer",
        is_approved: true,
      });

      expect(result).toEqual(mockFlashcard);
    });
  });

  describe("deleteFlashcardsByGroupId", () => {
    it("should delete all flashcards in a group successfully", async () => {
      const mockUserId = "test-user-id";

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const eq2Mock = vi.fn().mockResolvedValue({ error: null });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      });

      await expect(service.deleteFlashcardsByGroupId("group-1")).resolves.not.toThrow();
    });

    it("should throw error when group not found", async () => {
      const mockUserId = "test-user-id";

      vi.spyOn(mockSupabase, "getUserIdFromSession").mockResolvedValue(mockUserId);

      const eq2Mock = vi.fn().mockResolvedValue({
        error: { code: "23503" },
      });
      const eqMock = vi.fn().mockReturnValue({ eq: eq2Mock });

      vi.spyOn(mockSupabase, "from").mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      });

      await expect(service.deleteFlashcardsByGroupId("non-existent-group")).rejects.toThrow(
        ERROR_MESSAGES.GROUP_NOT_FOUND
      );
    });
  });
});
