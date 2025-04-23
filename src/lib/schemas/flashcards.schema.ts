import { z } from "zod";

export const FlashcardsListQuerySchema = z.object({
  group_id: z.string().uuid("Invalid group ID format"),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
  sort: z.enum(["updated_date", "creation_date"]).optional().default("updated_date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  source: z.enum(["manual", "ai"]).optional(),
});

export type FlashcardsListQuery = z.infer<typeof FlashcardsListQuerySchema>;

export const FlashcardIdSchema = z.object({
  id: z.string().uuid("Invalid flashcard ID format"),
});

export type FlashcardIdParams = z.infer<typeof FlashcardIdSchema>;

export const CreateFlashcardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(100, "Front text must not exceed 100 characters").trim(),
  back: z.string().min(1, "Back text is required").max(100, "Back text must not exceed 100 characters").trim(),
  group_id: z.string().uuid("Invalid group ID format"),
});

export const UpdateFlashcardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(100, "Front text must not exceed 100 characters").trim(),
  back: z.string().min(1, "Back text is required").max(100, "Back text must not exceed 100 characters").trim(),
  is_approved: z.boolean(),
});

export type UpdateFlashcardRequest = z.infer<typeof UpdateFlashcardSchema>;
