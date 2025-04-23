```markdown
# API Endpoint Implementation Plan: Flashcards

This document details the implementation plan for the Flashcards endpoints:
- GET /flashcards
- POST /flashcards
- GET /flashcards/{flashcardId}
- PUT /flashcards/{flashcardId}

---

## API Endpoint: GET /flashcards

### 1. Endpoint Overview
This endpoint allows fetching a list of flashcards for an authenticated user. It supports filtering by group and source (manual or ai), and includes pagination and sorting.

### 2. Request Details
- **HTTP Method:** GET  
- **URL Structure:** `/flashcards`  
- **Parameters:**
    - **Required:** None  
    - **Optional:**
        - `group_id` – filter by group identifier
        - `source` – filter by source (`manual` or `ai`)
        - `page` – page number (default is 1)
        - `limit` – number of items per page (default is 20)
        - `sort` – sort field (default is `updated_date`)
        - `order` – sort order (`asc` or `desc`, default is `desc`)
- **Request Body:** None

### 3. Types Used
- **DTO:** `FlashcardsListDTO` (contains `data: FlashcardDTO[]` and `pagination: PaginationDTO`)
- **FlashcardDTO:** as defined in the `flashcard` table

### 4. Response Details
- **Success:**
    - Status Code 200 OK
    - JSON:
        ```json
        {
            "data": [{
                "id": "uuid",
                "front": "string",
                "back": "string",
                "creation_date": "2024-01-20T12:00:00Z",
                "updated_date": "2024-01-20T12:00:00Z",
                "source": "manual|ai",
                "is_approved": true,
                "user_id": "uuid",
                "group_id": "uuid"
            }],
            "pagination": {
                "page": 1,
                "limit": 20,
                "total": 100
            }
        }
        ```
- **Errors:**
    - 401 Unauthorized – missing or invalid JWT token
    - 500 Internal Server Error – server-side error

### 5. Data Flow
1. Receive the request with optional query parameters.
2. Validate parameters using Zod (e.g., checking UUID, numeric values, allowed values for `source`, `sort`, and `order`).
3. Verify authorization based on the JWT token and apply RLS.
4. Call the service function (e.g., in `src/lib/services/flashcardService.ts`) to fetch data with filtering conditions, pagination, and sorting.
5. Format the data as a `FlashcardsListDTO` object.
6. Return a 200 OK response.

### 6. Security Considerations
- Authentication using Supabase auth (JWT token).
- Restrict data visibility to the specific user (RLS based on `user_id`).
- Validate all input parameters to prevent injection attacks.

### 7. Error Handling
- 401 Unauthorized – if the token is absent or invalid.
- 500 Internal Server Error – for server or database query issues.
- Detailed error logging to aid diagnostics.

### 8. Performance Considerations
- Pagination to limit the number of records and reduce server load.
- Use of indexes (e.g., `idx_flashcard_updated_date`) for efficient sorting and filtering.
- Minimize unnecessary database queries.

### 9. Implementation Steps
1. Create/update the parameter validation schema using Zod.
2. Implement the service function in `src/lib/services/flashcardService.ts` to fetch flashcards.
3. Create the endpoint in `src/pages/api/flashcards.ts`.
4. Test the endpoint using tools like Postman.
5. Update the API documentation.

---

## API Endpoint: POST /flashcards

### 1. Endpoint Overview
This endpoint allows creating a new flashcard. For manually created flashcards, the flashcard is automatically approved; for AI-generated flashcards, the approval status remains pending.

### 2. Request Details
- **HTTP Method:** POST  
- **URL Structure:** `/flashcards`  
- **Parameters:** None
- **Request Body:**  
    ```json
    {
        "front": "string (max 100 characters)",
        "back": "string (max 100 characters)",
        "group_id": "UUID"
    }
    ```
    - **Required:** `front`, `back`, `group_id`

### 3. Types Used
- **Command Model:** `CreateFlashcardCommand` (defined in types.ts)
- **DTO:** The response will include the created `FlashcardDTO` object

### 4. Response Details
- **Success:**
    - Status Code 201 Created
    - JSON with the created flashcard data
- **Errors:**
    - 400 Bad Request – validation errors (e.g., exceeding character limits)
    - 401 Unauthorized – missing or invalid JWT token

### 5. Data Flow
1. Receive the request with data in the Request Body.
2. Validate the input data using Zod (limit of 100 characters for front and back).
3. Set business fields: `source` to `"manual"` and `is_approved` to `true`.
4. Verify user authorization and check RLS.
5. Call the service function to save the new flashcard in the database (e.g., in `src/lib/services/flashcardService.ts`).
6. Return a 201 Created response with the created object.

### 6. Security Considerations
- Verify the JWT token.
- Validate the type and length of input fields.
- Apply RLS to ensure the user can only create flashcards for themselves.

### 7. Error Handling
- 400 Bad Request – if input validation fails.
- 401 Unauthorized – if the token is invalid or missing.
- 500 Internal Server Error – in case of database write issues.
- Detailed error logging for diagnostics.

### 8. Performance Considerations
- Minimize write operations to the database.
- Ensure validation is carried out on the server side to avoid unnecessary load.

### 9. Implementation Steps
1. Define the validation schema for the Request Body using Zod.
2. Implement the service function in `src/lib/services/flashcardService.ts` to create a flashcard.
3. Create the endpoint in `src/pages/api/flashcards.ts` with POST method handling.
4. Test the endpoint and update the documentation.

---

## API Endpoint: GET /flashcards/{flashcardId}

### 1. Endpoint Overview
This endpoint allows fetching detailed information about a single flashcard by its identifier.

### 2. Request Details
- **HTTP Method:** GET  
- **URL Structure:** `/flashcards/{flashcardId}`  
- **Parameters:**
    - **Required:** `flashcardId` (must be a valid UUID)
- **Request Body:** None

### 3. Types Used
- **DTO:** `FlashcardDTO` – represents the detailed flashcard data

### 4. Response Details
- **Success:**
    - Status Code 200 OK
    - JSON corresponding to the `FlashcardDTO` object
- **Errors:**
    - 401 Unauthorized – if JWT token is invalid
    - 404 Not Found – if the flashcard does not exist

### 5. Data Flow
1. Receive the request with the `flashcardId` parameter.
2. Validate the format of `flashcardId` (UUID) using Zod.
3. Verify user authorization.
4. Fetch the flashcard data using a service function (e.g., in `src/lib/services/flashcardService.ts`), considering RLS.
5. Return the `FlashcardDTO` object or the appropriate error.

### 6. Security Considerations
- Authenticate using JWT token.
- Restrict access using RLS so that the user sees only their flashcards.
- Validate the input identifier.

### 7. Error Handling
- 401 Unauthorized – if the token is invalid.
- 404 Not Found – if no flashcard is found with the given identifier.
- 500 Internal Server Error – for unexpected server errors.
- Log errors in detail for diagnostics.

### 8. Performance Considerations
- Use indexes on the `id` and `user_id` columns to speed up lookups.
- Optimize database queries.

### 9. Implementation Steps
1. Validate the `flashcardId` parameter using Zod.
2. Extend the service function in `src/lib/services/flashcardService.ts` with a method to fetch flashcard details.
3. Create the endpoint in `src/pages/api/flashcards/[flashcardId].ts`.
4. Test and verify the endpoint.

---

## API Endpoint: PUT /flashcards/{flashcardId}

### 1. Endpoint Overview
This endpoint allows updating an existing flashcard. Editable fields include `front`, `back`, and `is_approved`, with any change in approval status following business logic.

### 2. Request Details
- **HTTP Method:** PUT  
- **URL Structure:** `/flashcards/{flashcardId}`  
- **Parameters:**
    - **Required:** `flashcardId` (valid UUID)
- **Request Body:**  
    ```json
    {
        "front": "string (max 100 characters)",
        "back": "string (max 100 characters)",
        "is_approved": "boolean"
    }
    ```
    - **Required:** `front`, `back`, `is_approved`

### 3. Types Used
- **Command Model:** `UpdateFlashcardCommand` (defined in types.ts)
- **DTO:** The response will include the updated `FlashcardDTO` object

### 4. Response Details
- **Success:**
    - Status Code 200 OK
    - JSON with the updated flashcard data
- **Errors:**
    - 400 Bad Request – if input data is invalid
    - 401 Unauthorized – if the JWT token is missing or invalid
    - 404 Not Found – if the flashcard is not found
    - 500 Internal Server Error – server error

### 5. Data Flow
1. Receive the request with the `flashcardId` parameter and data in the Request Body.
2. Validate the `flashcardId` and fields `front`, `back` (max 100 characters) and `is_approved` using Zod.
3. Verify user authorization.
4. Call the service function to update the flashcard in the database (e.g., method in `src/lib/services/flashcardService.ts`).
5. Return the updated `FlashcardDTO` object.

### 6. Security Considerations
- Authenticate via JWT token.
- Use RLS to ensure the user can only update their own flashcards.
- Validate input data and restrict text field lengths.

### 7. Error Handling
- 400 Bad Request – for validation errors.
- 401 Unauthorized – if the user is not authenticated.
- 404 Not Found – if the flashcard does not exist.
- 500 Internal Server Error – for unexpected server errors.
- Detailed error logging for diagnostics.

### 8. Performance Considerations
- Updating a single record minimizes database load.
- Use indexes on `id` and `user_id` for fast record retrieval.

### 9. Implementation Steps
1. Create/update the validation schema for the Request Body for PUT using Zod.
2. Expand the service function in `src/lib/services/flashcardService.ts` with an update method.
3. Create the endpoint in `src/pages/api/flashcards/[flashcardId].ts` to handle the PUT method.
4. Test various update scenarios (valid inputs, invalid data, record not found).
5. Update documentation and perform integration tests.
```
