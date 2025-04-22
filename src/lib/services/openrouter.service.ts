import type { FlashcardAI as FlashcardProposals } from "@/types";
import { ERROR_MESSAGES } from "@/lib/constants";

export class OpenRouterService {
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private readonly maxResponseTime = 60000; // 30 seconds

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenRouter API key is required");
    }
  }

  async generateFlashcards(prompt: string, count: number): Promise<FlashcardProposals[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.maxResponseTime);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "10x Cards Flashcard Generator",
        },
        body: JSON.stringify({
          model: "google/gemma-3-27b-it:free",
          messages: [
            {
              role: "system",
              content: `You are a flashcard generation assistant. Generate ${count} flashcards based on the given text. 
              Each flashcard should have "front" and "back" properties, with text not exceeding 100 characters per side.
              Format the response as a raw JSON object with a "flashcards" array containing the generated flashcards. Do not add '\`\`\`json' prefix or new line characters'`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "flashcards",
              type: "array",
              strict: true,
              items: {
                type: "object",
                properties: {
                  front: { type: "string", maxLength: 100 },
                  back: { type: "string", maxLength: 100 },
                },
                required: ["front", "back"],
                additionalProperties: false,
              },
              required: ["flashcards"],
              additionalProperties: false,
            },
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`${ERROR_MESSAGES.OPENROUTER_ERROR}: ${response.statusText}`);
      }

      const rawJson = await response.json();
      console.debug("Raw API response:", rawJson);
      console.debug("Structured API message:", rawJson.choices[0].message);

      const flashcards = JSON.parse(rawJson.choices[0].message.content).flashcards as FlashcardProposals[];
      console.debug("Extracted flashcards:", flashcards);

      return flashcards;
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
