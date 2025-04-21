# REST API Plan

## 1. Resources
- **Users**: Managed by Supabase auth; represented by the `users` table.
- **Flashcards Group**: Represents collections of flashcards; mapped to the `flashcards_group` table.
- **Flashcard**: Represents individual flashcards; mapped to the `flashcard` table.

## 2. Endpoints

### Users (Authenticated via Supabase)
> *Note: User management and authentication are handled by Supabase. API endpoints assume that a valid user session is provided.*

#### GET /users/me
- **Description**: Retrieve current user information.
- **Response**:
  - **Success**: 200 OK with user data (id, email, created_at, etc.)
  - **Error**: 401 Unauthorized if session is invalid.

---

### Flashcards Groups

#### GET /flashcards/groups
- **Method**: GET  
- **Description**: Retrieve a list of flashcard groups for the authenticated user.
- **Query Parameters**:
  - `page` (optional): Page number for pagination.
  - `limit` (optional): Number of items per page.
  - `sort` (optional): Field to sort by (e.g., updated_date). `updated_date` is default.
  - `order` (optional): `asc` or `desc`. `desc` is default.
- **Response**:
  - **Success**: 200 OK with a JSON array of groups.
  - **Error**: 401 Unauthorized, 500 Internal Server Error.

#### POST /flashcards/groups
- **Method**: POST  
- **Description**: Create a new flashcards group.
- **Request Payload**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**:
  - **Success**: 201 Created with the created group details.
  - **Error**: 400 Bad Request (e.g., missing name), 401 Unauthorized.

#### GET /flashcards/groups/{groupId}
- **Method**: GET  
- **Description**: Retrieve details of a specific flashcards group.
- **Response**:
  - **Success**: 200 OK with group details.
  - **Error**: 401 Unauthorized, 404 Not Found.

#### PUT /flashcards/groups/{groupId}
- **Method**: PUT  
- **Description**: Update the name or associated AI prompt details of an existing group.
- **Request Payload**:
  ```json
  {
    "name": "string",
    "last_used_prompt": "string",         // optional, for storing latest AI prompt text (max 1000 characters)
    "last_used_cards_count": "number"       // optional, number of flashcards to generate (max 20)
  }
  ```
- **Response**:
  - **Success**: 200 OK with updated group details.
  - **Error**: 400 Bad Request (validation errors), 401 Unauthorized, 404 Not Found.

#### DELETE /flashcards/groups/{groupId}
- **Method**: DELETE  
- **Description**: Delete a specific flashcards group.
- **Response**:
  - **Success**: 200 OK or 204 No Content.
  - **Error**: 401 Unauthorized, 404 Not Found.

---

### Flashcards

#### GET /flashcards
- **Method**: GET  
- **Description**: Retrieve a list of flashcards for the authenticated user. Supports filtering by group.
- **Query Parameters**:
  - `groupId` (optional): Filter flashcards by group.
  - `source` (optional): Filter by source ('manual' or 'ai').
  - `page` (optional): Page number.
  - `limit` (optional): Items per page.
  - `sort` (optional): Field to sort by (e.g., updated_date). `updated_date` is default.
  - `order` (optional): `asc` or `desc`. `desc` is default.
- **Response**:
  - **Success**: 200 OK with an array of flashcard objects.
  - **Error**: 401 Unauthorized, 500 Internal Server Error.

#### POST /flashcards
- **Method**: POST  
- **Description**: Create a new flashcard. For manual flashcards, the flashcard is automatically approved. For AI-generated ones, approval is pending.
- **Request Payload**:
  ```json
  {
    "front": "string (max 100 characters)",
    "back": "string (max 100 characters)",
    "group_id": "UUID",
    "source": "manual | ai"  // 'manual' for user-created, 'ai' for AI-generated
  }
  ```
- **Response**:
  - **Success**: 201 Created with created flashcard details.
  - **Error**: 400 Bad Request (validation errors like character limits), 401 Unauthorized.

#### GET /flashcards/{flashcardId}
- **Method**: GET  
- **Description**: Retrieve details of a specific flashcard.
- **Response**:
  - **Success**: 200 OK with flashcard details.
  - **Error**: 401 Unauthorized, 404 Not Found.

#### PUT /flashcards/{flashcardId}
- **Method**: PUT  
- **Description**: Update an existing flashcard’s content. Only certain fields (front, back) are editable.
- **Request Payload**:
  ```json
  {
    "front": "string (max 100 characters)",
    "back": "string (max 100 characters)"
  }
  ```
- **Response**:
  - **Success**: 200 OK with updated details.
  - **Error**: 400 Bad Request, 401 Unauthorized, 404 Not Found.

#### DELETE /flashcards/{flashcardId}
- **Method**: DELETE  
- **Description**: Delete a specific flashcard.
- **Response**:
  - **Success**: 200 OK or 204 No Content.
  - **Error**: 401 Unauthorized, 404 Not Found.

---

### AI Flashcard Generation

#### POST /flashcards/ai
- **Method**: POST  
- **Description**: Generate multiple flashcards using an AI service. Accepts an AI prompt (max 1000 characters) and a number of flashcards (maximum 20) to generate.
- **Request Payload**:
  ```json
  {
    "group_id": "UUID",
    "prompt": "string (max 1000 characters)",
    "cards_count": "number (max 20)"
  }
  ```
- **Response**:
  - **Success**: 200 OK with a list of generated flashcards (pending approval).
  - **Error**: 400 Bad Request (if prompt length > 1000 or cards_count > 20), 401 Unauthorized.
- **Business Logic**:
  - Store the last used prompt and the number of flashcards in the corresponding flashcards group (`last_used_prompt` and `last_used_cards_count`).
  - Validate input (length and count restrictions) and log detailed error information if validation fails.
  - Store all generated flashcards in the DB setting `is_generated_by_ai = true` and `is_approved = false`.

---

## 3. Authentication and Authorization
- **Mechanism**: Use Supabase authentication.
  - The API endpoints require a valid user session (e.g., JWT token) provided via headers or cookies.
  - Endpoints automatically enforce row-level security (RLS) based on the authenticated user's `id`.
- **Implementation**:
  - Middleware will extract the user ID from the incoming request and verify the session.
  - Each API endpoint queries data using the user’s id to ensure that users can only access their own records.

---

## 4. Validation and Business Logic

### Validation
- **Flashcards**: 
  - `front` and `back` fields are limited to 100 characters.
- **AI Generation**:
  - `prompt` must be no more than 1000 characters.
  - `cards_count` must not exceed 20.
- **General**:
  - Input payloads are validated using Zod schemas.
  - Early returns and guard clauses are utilized in route handlers.
  - Detailed error logging is performed when validation fails.

### Business Logic Implementation
- **Manual vs. AI Flashcards**:
  - For manual flashcards: `is_approved` is set to true automatically.
  - For AI-generated flashcards: `is_approved` is initially false; user approval is required.
- **Flashcards Groups Management**:
  - Users can create, update, view, and delete groups.
  - Updates to groups may also store recent AI prompt data to streamline future AI flashcard generation.
- **Pagination, Sorting, and Filtering**:
  - Support for pagination, sorting, and filtering is built into list endpoints to improve performance and usability.
- **Error Handling**:
  - Each endpoint includes error handling at the start of the function (guard clauses) to validate input and user permissions.
  - Consistent error messages and HTTP status codes are returned for various error conditions.

---

## Additional Security and Performance Considerations
- **Security**:
  - Enforce Supabase RLS to restrict data access based on user id.
  - Validate input data and log errors for audit purposes.
  - Use HTTPS for secure data transmission.
- **Performance**:
  - Implement pagination and indexing (as noted in the database schema) to ensure efficient queries.
  - Use caching strategies where applicable.
  - Consider rate-limiting endpoints to prevent abuse.

This plan maps the core database schema and product requirements to a comprehensive REST API, ensuring robust validation, secure user access, and clear separation between manual and AI-driven flashcard functionalities.