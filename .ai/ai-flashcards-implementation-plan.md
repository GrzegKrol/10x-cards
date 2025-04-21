# API Endpoint Implementation Plan: POST /flashcards/ai

## 1. Endpoint Overview
An endpoint for generating flashcards using artificial intelligence. Takes a prompt text and desired number of flashcards, then uses the Openrouter.ai service to generate a set of flashcards for a given group. Generated flashcards are saved in the database with "pending approval" status.

## 2. Request Details
- HTTP Method: POST
- URL Structure: `/api/flashcards/ai`
- Request Body:
  ```typescript
  {
    groupId: string;    // Group UUID
    prompt: string;     // min 50, max 5000 characters
    cardsCount: number; // max 50 flashcards
  }
  ```

## 3. Types Used
```typescript
// Request Command model
import { AICreateFlashcardCommand } from '@/types';

// Validation schema
import { z } from 'zod';

const AIFlashcardsRequestSchema = z.object({
  groupId: z.string().uuid(),
  prompt: z.string().min(50).max(5000),
  cardsCount: z.number().int().min(1).max(50)
});

// Response DTO
interface AIGeneratedFlashcardsResponse {
  flashcards: FlashcardDTO[];
}

// Single Flashcard AI Response schema
interface FlashcardAI {
  front: string;
  back: string;
}
```

## 4. Response Details
- Success (200 OK):
  ```typescript
  {
    flashcards: [
      {
        id: string;
        front: string;
        back: string;
        creationDate: string;
        updatedDate: string;
        source: "ai";
        isApproved: false;
        userId: string;
        groupId: string;
      }
    ]
  }
  ```
- Errors:
  - 400: Invalid input
  - 401: Unauthorized
  - 404: Group not found
  - 500: Server/AI service error

## 5. Data Flow
1. Request and authentication validation
2. Group retrieval and verification
3. AI service invocation
4. Generated flashcards storage
5. Group metadata update
6. Response return

## 6. Security Considerations
- User authentication via Supabase
- Group access authorization
- Input validation and sanitization
- AI calls rate limiting
- Security error logging
- Sensitive data filtering in logs

## 7. Error Handling
- Input validation:
  ```typescript
  interface ValidationError {
    error: string;
    details: {
      field: string;
      message: string;
    }[];
  }
  ```
- Business errors:
  - Group not found
  - Exceeded limits
  - AI service errors
- Technical errors:
  - Database issues
  - AI service timeout
  - Server errors

## 8. Performance
- Asynchronous AI communication
- Optimized database queries
- Batch flashcard saving
- Response time monitoring
- Prompt caching (future optimization)

## 9. Implementation Steps

1. Create AI service:
```typescript
// src/lib/services/openrouter.service.ts
export class OpenRouterService {
  constructor(private apiKey: string) {}
  
  async generateFlashcards(prompt: string, count: number): Promise<FlashcardAI[]>;
}
```

2. Create AI flashcards service:
```typescript
// src/lib/services/ai-flashcards.service.ts
export class AIFlashcardsService {
  constructor(
    private supabase: SupabaseClient,
    private openRouter: OpenRouterService
  ) {}

  async generateFlashcards(command: AICreateFlashcardCommand): Promise<FlashcardDTO[]>;
}
```

3. Implement endpoint:
```typescript
// src/pages/api/flashcards/ai.ts
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Implementation
};
```

4. Create tests:
```typescript
// src/pages/api/__tests__/flashcards-ai.test.ts
describe('POST /api/flashcards/ai', () => {
  // Test cases
});
```

5. Implementation order:
   1. Validation schema
   2. OpenRouter service
   3. AI Flashcards service
   4. Endpoint handler
   5. Unit tests
   6. Integration tests
   7. Documentation
   8. Monitoring and logging
   9. Rate limiting
