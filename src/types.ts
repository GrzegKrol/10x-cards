import type { Database } from "./db/database.types";

// ===================== Utility Types =====================

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

type CamelizeKeys<T> = {
  [K in keyof T as CamelCase<K & string>]: T[K] extends Record<string, unknown> ? CamelizeKeys<T[K]> : T[K];
};

// ===================== DTOs =====================

// User Data Transfer Object (retrieved via Supabase auth)
export interface UserDTO {
  id: string;
  email: string;
  createdAt: string;
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

// Transformed DTOs with camelCase properties
export type FlashcardGroupDTO = CamelizeKeys<FlashcardGroupRow>;
export type FlashcardDTO = CamelizeKeys<FlashcardRow>;

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
  lastUsedPrompt?: string; // optional, max 1000 characters
  lastUsedCardsCount?: number; // optional, max 20
}

// Command for creating a new flashcard via POST /flashcards
export interface CreateFlashcardCommand {
  front: string; // max 100 characters
  back: string; // max 100 characters
  groupId: string; // UUID of the associated flashcard group
}

// Command for updating an existing flashcard via PUT /flashcards/{flashcardId}
export interface UpdateFlashcardCommand {
  front: string; // max 100 characters
  back: string; // max 100 characters
  isApproved: boolean; // whether the flashcard is approved
}

// Command for generating flashcards using AI via POST /flashcards/ai
export interface AICreateFlashcardCommand {
  groupId: string; // UUID of the associated flashcard group
  prompt: string; // max 1000 characters
  cardsCount: number; // maximum 20 flashcards to generate
}
