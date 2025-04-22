-- Migration: disable_rls_and_remove_policies
-- Description: Removes RLS and policies for development environment
-- Author: GitHub Copilot
-- Date: 2025-04-22

-- Disable RLS on tables
ALTER TABLE flashcards_group DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard DISABLE ROW LEVEL SECURITY;

-- Drop policies for flashcards_group
DROP POLICY IF EXISTS "Users can view their own flashcard groups" ON flashcards_group;
DROP POLICY IF EXISTS "Users can create their own flashcard groups" ON flashcards_group;
DROP POLICY IF EXISTS "Users can update their own flashcard groups" ON flashcards_group;
DROP POLICY IF EXISTS "Users can delete their own flashcard groups" ON flashcards_group;
DROP POLICY IF EXISTS "No access for anonymous users to flashcard groups" ON flashcards_group;

-- Drop policies for flashcard
DROP POLICY IF EXISTS "Users can view their own flashcards" ON flashcard;
DROP POLICY IF EXISTS "Users can create their own flashcards" ON flashcard;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON flashcard;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON flashcard;
DROP POLICY IF EXISTS "No access for anonymous users to flashcards" ON flashcard;