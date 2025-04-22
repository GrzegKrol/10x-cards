import { z } from "zod";

export const AIFlashcardsRequestSchema = z.object({
  group_id: z.string().uuid("Group ID must be a valid UUID"),
  prompt: z
    .string()
    .min(50, "Prompt must be at least 50 characters long")
    .max(5000, "Prompt must not exceed 5000 characters"),
  cards_count: z
    .number()
    .int("Number of cards must be an integer")
    .min(1, "Must generate at least 1 card")
    .max(50, "Cannot generate more than 50 cards"),
});

export type AIFlashcardsRequest = z.infer<typeof AIFlashcardsRequestSchema>;
