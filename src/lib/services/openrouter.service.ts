import type { FlashcardAI, OpenRouterResponse } from "@/types";
import { ERROR_MESSAGES } from "@/lib/constants";

export class OpenRouterService {
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private readonly maxResponseTime = 60000; // 30 seconds

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenRouter API key is required");
    }
  }

  async generateFlashcards(prompt: string, count: number): Promise<FlashcardAI[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.maxResponseTime);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": import.meta.env.PUBLIC_APP_URL || "http://localhost:4321",
          "X-Title": "10x Cards Flashcard Generator",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-nano",
          messages: [
            {
              role: "system",
              content: `You are a flashcard generation assistant. Generate ${count} flashcards based on the given text. Output should be a valid JSON array with objects containing "front" and "back" properties. Each side should be concise and not exceed 100 characters.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`${ERROR_MESSAGES.OPENROUTER_ERROR}: ${response.statusText}`);
      }

      const data = (await response.json()) as OpenRouterResponse;
      return data.choices[0].message.content;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("OpenRouter API request timed out");
        }
        throw new Error(`${ERROR_MESSAGES.OPENROUTER_ERROR}: ${error.message}`);
      }
      throw new Error(ERROR_MESSAGES.OPENROUTER_ERROR);
    }
  }
}
