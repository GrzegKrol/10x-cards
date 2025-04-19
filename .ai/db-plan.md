# Database Schema Plan

## 1. Tables

### users
This table is managed by Supabase auth.

- id: UUID PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmad_at: TIMESTAMPTZ

### flashcards_group
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES users(id)   // user.id from Supabase auth table
- name: TEXT NOT NULL
- creation_date: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_date: TIMESTAMPTZ NOT NULL DEFAULT now()
- last_used_prompt: TEXT
- last_used_cards_count: INTEGER DEFAULT 0

### flashcard
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- front: VARCHAR(100) NOT NULL  -- limited to 100 characters
- back: VARCHAR(100) NOT NULL   -- limited to 100 characters
- creation_date: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_date: TIMESTAMPTZ NOT NULL DEFAULT now()
- is_generated_by_ai: BOOLEAN DEFAULT false
- is_approved: BOOLEAN DEFAULT false
- user_id: UUID NOT NULL REFERENCES users(id)
- group_id: UUID NOT NULL REFERENCES flashcards_group(id)

## 2. Relationships
- One-to-many: A user (users) owns many flashcards_group (via user_id).
- One-to-many: Each flashcards_group contains many flashcard (via group_id).
- Each flashcard is linked to a user (via user_id).

## 3. Indexes
- CREATE INDEX idx_flashcard_user_id ON flashcard(user_id);
- CREATE INDEX idx_flashcard_group_id ON flashcard(group_id);
- CREATE INDEX idx_flashcard_updated_date ON flashcard(updated_date);
- CREATE INDEX idx_flashcards_group_updated_date ON flashcards_group(updated_date);

## 4. Row Level Security (RLS)
- Enable RLS to leverage Supabase’s built-in security that user can access only his flashcards_group and flashcards. User should have access to entities where users.id equas user_id.

## 5. Additional Notes
- All primary keys use UUIDs.
- Timestamp defaults utilize now() to record creation and update times.
