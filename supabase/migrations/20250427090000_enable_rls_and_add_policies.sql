-- Migration: enable_rls_and_add_policies
-- Description: Re-enables RLS and recreates security policies for production environment
-- Author: GitHub Copilot
-- Date: 2025-04-27

-- Enable RLS on tables
ALTER TABLE flashcards_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard ENABLE ROW LEVEL SECURITY;

-- Create policies for flashcards_group
CREATE POLICY "Users can view their own flashcard groups"
    ON flashcards_group
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcard groups"
    ON flashcards_group
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard groups"
    ON flashcards_group
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard groups"
    ON flashcards_group
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "No access for anonymous users to flashcard groups"
    ON flashcards_group
    FOR ALL
    TO anon
    USING (false);

-- Create policies for flashcard
CREATE POLICY "Users can view their own flashcards"
    ON flashcard
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcards"
    ON flashcard
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
    ON flashcard
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
    ON flashcard
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "No access for anonymous users to flashcards"
    ON flashcard
    FOR ALL
    TO anon
    USING (false);