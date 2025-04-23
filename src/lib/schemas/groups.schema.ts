import { z } from "zod";

export const GroupsListQuerySchema = z.object({
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
  sort: z.enum(["updated_date", "name"]).optional().default("updated_date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GroupsListQuery = z.infer<typeof GroupsListQuerySchema>;

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").trim(),
});

export type CreateGroupRequest = z.infer<typeof CreateGroupSchema>;

export const GroupIdSchema = z.object({
  id: z.string().uuid("Invalid group ID format"),
});

export type GroupIdParams = z.infer<typeof GroupIdSchema>;

export const UpdateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").trim(),
  last_used_prompt: z
    .string()
    .min(50, "Prompt must be at least 50 characters")
    .max(5000, "Prompt must not exceed 5000 characters")
    .optional(),
  last_used_cards_count: z.number().int().min(0).max(50).optional(),
});

export type UpdateGroupRequest = z.infer<typeof UpdateGroupSchema>;
