-- Migration: update_flashcard_generation_constraints
-- Description: Updates the constraints for AI flashcard generation parameters
-- Author: GitHub Copilot
-- Date: 2025-04-21

-- Add check constraint for last_used_cards_count
alter table flashcards_group
  drop constraint if exists check_last_used_cards_count,
  add constraint check_last_used_cards_count 
  check (last_used_cards_count >= 0 and last_used_cards_count <= 50);

-- Add check constraint for last_used_prompt length
alter table flashcards_group
  drop constraint if exists check_last_used_prompt_length,
  add constraint check_last_used_prompt_length 
  check (
    last_used_prompt is null or 
    (length(last_used_prompt) >= 50 and length(last_used_prompt) <= 5000)
  );

comment on constraint check_last_used_cards_count on flashcards_group is 'Ensures the number of cards to generate is between 0 and 50';
comment on constraint check_last_used_prompt_length on flashcards_group is 'Ensures the AI prompt length is between 50 and 5000 characters';