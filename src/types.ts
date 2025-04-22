import type { Database } from "./db/database.types";

// ===================== DTOs =====================

// User Data Transfer Object (retrieved via Supabase auth)
export interface UserDTO {
  id: string;
  email: string;
  created_at: string;
}

// Pagination info used in list endpoints
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

// Base DB Row types
type FlashcardGroupRow = Database["public"]["Tables"]["flashcards_group"]["Row"];
type FlashcardRow = Database["public"]["Tables"]["flashcard"]["Row"];

// DTOs match database row types
export type FlashcardGroupDTO = FlashcardGroupRow;
export type FlashcardDTO = FlashcardRow;

// List responses
export interface GroupsListDTO {
  data: FlashcardGroupDTO[];
  pagination: PaginationDTO;
}

export interface FlashcardsListDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

// ===================== Command Models =====================

// Command for creating a new flashcard group via POST /groups
export interface CreateFlashcardGroupCommand {
  // Only name is expected from client; user id and dates are managed server‐side.
  name: string;
}

// Command for updating a flashcard group via PUT /groups/{groupId}
export interface UpdateFlashcardGroupCommand {
  // Name is expected and optional prompt related details
  name: string;
  last_used_prompt?: string; // optional, min 50, max 5000 characters
  last_used_cards_count?: number; // optional, max 50
}

// Command for creating a new flashcard via POST /flashcards
export interface CreateFlashcardCommand {
  front: string; // max 100 characters
  back: string; // max 100 characters
  group_id: string; // UUID of the associated flashcard group
}

// Command for updating an existing flashcard via PUT /flashcards/{flashcardId}
export interface UpdateFlashcardCommand {
  front: string; // max 100 characters
  back: string; // max 100 characters
  is_approved: boolean; // whether the flashcard is approved
}

// Command for generating flashcards using AI via POST /flashcards/ai
export interface AICreateFlashcardCommand {
  group_id: string; // UUID of the associated flashcard group
  prompt: string; // min 50, max 5000 characters
  cards_count: number; // maximum 50 flashcards to generate
  user_id: string; // user ID for development
}

// OpenRouter API types
export interface OpenRouterResponse {
  choices: {
    message: {
      content: FlashcardAI[];
    };
  }[];
}

export interface FlashcardAI {
  front: string;
  back: string;
}
