-- Migration: create_initial_schema
-- Description: Creates the initial schema for the flashcards application
-- Author: GitHub Copilot
-- Date: 2025-04-19
-- 
-- This migration:
-- 1. Creates flashcards_group table
-- 2. Creates flashcard table
-- 3. Sets up indexes for performance
-- 4. Enables RLS and creates security policies
-- 5. Sets up foreign key relationships

-- Create flashcards_group table
create table flashcards_group (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    creation_date timestamptz not null default now(),
    updated_date timestamptz not null default now(),
    last_used_prompt text,
    last_used_cards_count integer default 0
);

-- Create flashcard table
create table flashcard (
    id uuid primary key default gen_random_uuid(),
    front varchar(100) not null,
    back varchar(100) not null,
    creation_date timestamptz not null default now(),
    updated_date timestamptz not null default now(),
    is_generated_by_ai boolean default false,
    is_approved boolean default false,
    user_id uuid not null references auth.users(id) on delete cascade,
    group_id uuid not null references flashcards_group(id) on delete cascade
);

-- Create indexes for better query performance
create index idx_flashcard_user_id on flashcard(user_id);
create index idx_flashcard_group_id on flashcard(group_id);
create index idx_flashcard_updated_date on flashcard(updated_date);
create index idx_flashcards_group_updated_date on flashcards_group(updated_date);

-- Enable Row Level Security
alter table flashcards_group enable row level security;
alter table flashcard enable row level security;

-- RLS Policies for flashcards_group

-- Policy for authenticated users to select their own groups
create policy "Users can view their own flashcard groups"
    on flashcards_group
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own groups
create policy "Users can create their own flashcard groups"
    on flashcards_group
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own groups
create policy "Users can update their own flashcard groups"
    on flashcards_group
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own groups
create policy "Users can delete their own flashcard groups"
    on flashcards_group
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policies for flashcard

-- Policy for authenticated users to select their own flashcards
create policy "Users can view their own flashcards"
    on flashcard
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own flashcards
create policy "Users can create their own flashcards"
    on flashcard
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own flashcards
create policy "Users can update their own flashcards"
    on flashcard
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own flashcards
create policy "Users can delete their own flashcards"
    on flashcard
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Block access for anon users
create policy "No access for anonymous users to flashcard groups"
    on flashcards_group
    for all
    to anon
    using (false);

create policy "No access for anonymous users to flashcards"
    on flashcard
    for all
    to anon
    using (false);
