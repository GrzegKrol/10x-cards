import { describe, expect, it, vi, beforeEach } from "vitest";
import type { APIRoute } from "astro";
import { POST } from "../flashcards/ai";
import { AIFlashcardsService } from "@/lib/services/ai-flashcards.service";
import type { FlashcardDTO } from "@/types";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

vi.mock("@/lib/services/openrouter.service");
vi.mock("@/lib/services/ai-flashcards.service");

describe("POST /api/flashcards/ai", () => {
  const mockFlashcards: FlashcardDTO[] = [
    {
      id: "123",
      front: "Test front",
      back: "Test back",
      creationDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      source: "ai",
      isApproved: false,
      userId: DEFAULT_USER_ID,
      groupId: "test-group",
    },
  ];

  const validRequest = {
    groupId: "123e4567-e89b-12d3-a456-426614174000",
    prompt: "Generate flashcards about TypeScript fundamentals with clear examples.",
    cardsCount: 5,
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate flashcards successfully", async () => {
    const mockSupabase = {
      supabase: {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: "test-group" } }),
      },
    };

    vi.mocked(AIFlashcardsService.prototype.generateFlashcards).mockResolvedValue(mockFlashcards);

    const response = await POST({
      request: new Request("http://localhost/api/flashcards/ai", {
        method: "POST",
        body: JSON.stringify(validRequest),
      }),
      locals: mockSupabase,
    } as Parameters<APIRoute>[0]);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ flashcards: mockFlashcards });
  });

  it("should return 400 for invalid request", async () => {
    const invalidRequest = {
      groupId: "invalid-uuid",
      prompt: "too short",
      cardsCount: 100,
    };

    const response = await POST({
      request: new Request("http://localhost/api/flashcards/ai", {
        method: "POST",
        body: JSON.stringify(invalidRequest),
      }),
      locals: {},
    } as Parameters<APIRoute>[0]);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("should return 404 when group is not found", async () => {
    const mockSupabase = {
      supabase: {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null }),
      },
    };

    vi.mocked(AIFlashcardsService.prototype.generateFlashcards).mockRejectedValue(
      new Error("Group not found or access denied")
    );

    const response = await POST({
      request: new Request("http://localhost/api/flashcards/ai", {
        method: "POST",
        body: JSON.stringify(validRequest),
      }),
      locals: mockSupabase,
    } as Parameters<APIRoute>[0]);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Group not found or access denied");
  });

  it("should return 500 for other errors", async () => {
    const mockSupabase = {
      supabase: {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: "test-group" } }),
      },
    };

    vi.mocked(AIFlashcardsService.prototype.generateFlashcards).mockRejectedValue(new Error("OpenRouter API error"));

    const response = await POST({
      request: new Request("http://localhost/api/flashcards/ai", {
        method: "POST",
        body: JSON.stringify(validRequest),
      }),
      locals: mockSupabase,
    } as Parameters<APIRoute>[0]);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("OpenRouter API error");
  });
});
