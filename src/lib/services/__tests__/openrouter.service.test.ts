import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "../openrouter.service";
import { ERROR_MESSAGES } from "@/lib/constants";

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    service = new OpenRouterService(mockApiKey);
    vi.stubGlobal("fetch", vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("should throw error when initialized without API key", () => {
    expect(() => new OpenRouterService("")).toThrow("OpenRouter API key is required");
  });

  describe("generateFlashcards", () => {
    it("should generate flashcards successfully", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  { front: "Test Question 1", back: "Test Answer 1" },
                  { front: "Test Question 2", back: "Test Answer 2" },
                ],
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.generateFlashcards("Test prompt", 2);

      expect(result).toEqual([
        { front: "Test Question 1", back: "Test Answer 1" },
        { front: "Test Question 2", back: "Test Answer 2" },
      ]);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should handle API errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad Request"),
      });

      await expect(service.generateFlashcards("Test prompt", 2)).rejects.toThrow(
        `${ERROR_MESSAGES.OPENROUTER_ERROR} (400): Bad Request`
      );
    });

    it("should handle timeout errors", async () => {
      const abortError = new Error("Timeout");
      abortError.name = "AbortError";

      global.fetch = vi.fn().mockRejectedValue(abortError);

      await expect(service.generateFlashcards("Test prompt", 1)).rejects.toThrow("OpenRouter API request timed out");
    });

    it("should handle invalid JSON response", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Invalid JSON",
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(service.generateFlashcards("Test prompt", 2)).rejects.toThrow(ERROR_MESSAGES.OPENROUTER_ERROR);
    });

    it("should handle network errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(service.generateFlashcards("Test prompt", 2)).rejects.toThrow(
        `${ERROR_MESSAGES.OPENROUTER_ERROR}: Network error`
      );
    });

    it("should handle missing or invalid response structure", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({}), // Missing flashcards array
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(service.generateFlashcards("Test prompt", 2)).rejects.toThrow(ERROR_MESSAGES.OPENROUTER_ERROR);
    });
  });
});
