export const ERROR_MESSAGES = {
  GROUP_NOT_FOUND: "Group not found or access denied",
  VALIDATION_FAILED: "Validation failed",
  SAVE_FLASHCARDS_FAILED: "Failed to save flashcards",
  SAVE_GROUP_FAILED: "Failed to save group",
  OPENROUTER_ERROR: "OpenRouter API error",
  INTERNAL_ERROR: "Internal server error",
  FLASHCARD_NOT_FOUND: "Flashcard not found",
  DELETE_FLASHCARD_FAILED: "Failed to delete flashcard",
  DELETE_ALL_FLASHCARDS_FAILED: "Failed to delete all flashcards from group",
  UNAUTHORIZED_ACCESS: "You don't have permission to perform this action",
  FETCH_FLASHCARDS_FAILED: "Failed to fetch flashcards",
  CREATE_FLASHCARD_FAILED: "Failed to create flashcard",
  UPDATE_FLASHCARD_FAILED: "Failed to update flashcard",
} as const;

export const HTTP_HEADERS = {
  JSON_CONTENT_TYPE: { "Content-Type": "application/json" },
} as const;

export const DB_TABLES = {
  FLASHCARD: "flashcard",
  FLASHCARD_GROUP: "flashcards_group",
} as const;
