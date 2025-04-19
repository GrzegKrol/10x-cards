<decisions>
1. Flashcards entity will include: front, back, creation_date, updated_date, is_generated_by_ai, is_approved (boolean), user_id, and group_id.
2. User authentication is managed by Supabase standard mechanisms; no changes to user fields are required.
3. FlashcardsGroup entity will include: id, name, creation_date, updated_date, last_used_prompt, and last_used_cards_count, establishing that a user can have many groups.
4. All primary keys will use UUIDs.
5. The front and back fields in Flashcards are limited to a maximum of 100 characters.
6. Indexes will be added on user_id, group_id, and updated_date.
7. Row Level Security will rely on Supabase’s built-in security mechanisms.
</decisions>

<matched_recommendations>
1. Define separate tables for FlashcardsGroup and Flashcards with UUID primary keys.
2. Establish relationships where a User owns many FlashcardsGroups, and each FlashcardsGroup contains many Flashcards, ensuring each Flashcard belongs to one group.
3. Apply constraints on text fields (front and back) to enforce a 100-character limit.
4. Create indexes on foreign key columns (user_id and group_id) and on the updated_date column for performance.
5. Implement RLS using Supabase’s standard security mechanisms.
</matched_recommendations>

<database_planning_summary>
The planned database schema for the MVP includes three main entities: User, FlashcardsGroup, and Flashcards. User authentication is handled by Supabase standard mechanisms, so no adjustments to the user fields are needed. The FlashcardsGroup entity stores group details such as name, creation_date, updated_date, last_used_prompt, and last_used_cards_count, creating a one-to-many relationship with Flashcards. The Flashcards entity contains individual flashcards with a front and back (each limited to 100 characters), creation_date, updated_date, flags for AI generation and approval, and foreign keys referencing both the User and FlashcardsGroup. UUIDs are utilized as primary keys across all tables, and indexes on user_id, group_id, and updated_date are recommended to enhance query performance. Row Level Security will be enforced through Supabase’s built-in mechanisms.
</database_planning_summary>
