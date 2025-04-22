export const ERROR_MESSAGES = {
  GROUP_NOT_FOUND: "Group not found or access denied",
  VALIDATION_FAILED: "Validation failed",
  SAVE_FLASHCARDS_FAILED: "Failed to save flashcards",
  OPENROUTER_ERROR: "OpenRouter API error",
  INTERNAL_ERROR: "Internal server error",
} as const;

export const HTTP_HEADERS = {
  JSON_CONTENT_TYPE: { "Content-Type": "application/json" },
} as const;

export const DB_TABLES = {
  FLASHCARD: "flashcard",
  FLASHCARD_GROUP: "flashcards_group",
} as const;
