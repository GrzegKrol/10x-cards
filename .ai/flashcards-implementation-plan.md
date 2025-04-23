# API Endpoint Implementation Plan: Flashcards

This document details the implementation plan for the Flashcards endpoints:
- GET /flashcards
- POST /flashcards
- GET /flashcards/{flashcardId}
- PUT /flashcards/{flashcardId}

---

## API Endpoint: GET /flashcards

### 1. Endpoint Overview
This endpoint retrieves a list of flashcards for an authenticated user. It supports filtering by group and source (manual or AI) as well as pagination and sorting.

### 2. Request Details
- **HTTP Method:** GET  
- **URL Structure:** `/flashcards`  
- **Parameters:**
    - **Required:** None  
    - **Optional:**
        - `group_id` – filter by the group ID
        - `source` – filter by source (`manual` or `ai`)
        - `page` – page number (default: 1)
        - `limit` – items per page (default: 20)
        - `sort` – sort field (default: `updated_date`)
        - `order` – sort order (`asc` or `desc`, default: `desc`)
- **Request Body:** None

### 3. Data Types Used
- **DTO:** `FlashcardsListDTO` (contains `data: FlashcardDTO[]` and `pagination: PaginationDTO`)
- **FlashcardDTO:** conforms with the definition in the `flashcard` table

### 4. Response Details
- **Success:**
    - Status: 200 OK
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
2. Validate the parameters using Zod (e.g., checking UUIDs, numeric values, and allowed values for `source`, `sort`, and `order`).
3. Verify authorization based on the JWT token and apply RLS.
4. Call the service function (e.g., in `src/lib/services/flashcardService.ts`) to retrieve data with the appropriate filtering, pagination, and sorting.
5. Format the data as a `FlashcardsListDTO` object.
6. Return the response with a 200 OK status.

### 6. Security Considerations
- Authentication via Supabase Auth (JWT token).
- Limit data visibility to the respective user using RLS based on `user_id`.
- Validate all input parameters to prevent injection attacks.

### 7. Error Handling
- 401 Unauthorized – when the token is missing or invalid.
- 500 Internal Server Error – for server-related issues or database query errors.
- Log detailed errors for diagnostics.

### 8. Performance Considerations
- Use pagination to limit the number of records and reduce server load.
- Leverage indexes (e.g., `idx_flashcard_updated_date`) for efficient sorting and filtering.
- Minimize redundant database queries.

### 9. Implementation Steps
1. Create/update the parameter validation schema using Zod.
2. Implement the service function in `src/lib/services/flashcardService.ts` to fetch flashcards.
3. Create the endpoint in `src/pages/api/flashcards.ts`.
4. Test the endpoint using tools like Postman.
5. Update the API documentation.

---

## API Endpoint: POST /flashcards

### 1. Endpoint Overview
This endpoint creates a new flashcard. For manually created flashcards, the card is automatically approved; for AI-generated flashcards, the approval status remains pending.

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

### 3. Data Types Used
- **Command Model:** `CreateFlashcardCommand` (defined in types.ts)
- **DTO:** The response will include the newly created `FlashcardDTO` object

### 4. Response Details
- **Success:**
    - Status: 201 Created
    - JSON containing the new flashcard data
- **Errors:**
    - 400 Bad Request – validation errors (e.g., character limit exceeded)
    - 401 Unauthorized – missing or invalid JWT token

### 5. Data Flow
1. Receive the request with the request body data.
2. Validate the input data using Zod (limit of 100 characters for both front and back).
3. Set business logic fields: `source` to `"manual"` and `is_approved` to `true`.
4. Verify user authorization and enforce RLS.
5. Call the service function to save the new flashcard in the database (e.g., `src/lib/services/flashcardService.ts`).
6. Return a 201 Created response with the created object.

### 6. Security Considerations
- Verify JWT token.
- Validate the type and length of input fields.
- Use RLS to ensure users can only create flashcards for themselves.

### 7. Error Handling
- 400 Bad Request – for input validation failures.
- 401 Unauthorized – when the token is missing or invalid.
- 500 Internal Server Error – for database write or other server errors.
- Log detailed error messages for troubleshooting.

### 8. Performance Considerations
- Minimize database write operations.
- Ensure server-side validation to prevent unnecessary load.

### 9. Implementation Steps
1. Define the request body validation schema using Zod.
2. Implement the service function in `src/lib/services/flashcardService.ts` to create a flashcard.
3. Create the endpoint in `src/pages/api/flashcards.ts` handling the POST method.
4. Test the endpoint and update the documentation.

---

## API Endpoint: GET /flashcards/{flashcardId}

### 1. Endpoint Overview
This endpoint retrieves detailed information about a single flashcard using its identifier.

### 2. Request Details
- **HTTP Method:** GET  
- **URL Structure:** `/flashcards/{flashcardId}`  
- **Parameters:**
    - **Required:** `flashcardId` (must be a valid UUID)
- **Request Body:** None

### 3. Data Types Used
- **DTO:** `FlashcardDTO` – represents detailed flashcard data

### 4. Response Details
- **Success:**
    - Status: 200 OK
    - JSON corresponding to the `FlashcardDTO` object
- **Errors:**
    - 401 Unauthorized – when the JWT token is invalid
    - 404 Not Found – when the flashcard does not exist

### 5. Data Flow
1. Receive the request with the `flashcardId` parameter.
2. Validate the format of `flashcardId` (UUID) using Zod.
3. Verify user authorization.
4. Retrieve flashcard data using the service function (e.g., in `src/lib/services/flashcardService.ts`), applying RLS.
5. Return the `FlashcardDTO` object or an appropriate error.

### 6. Security Considerations
- Authenticate via JWT.
- Restrict access using RLS so the user sees only their flashcards.
- Validate the input identifier.

### 7. Error Handling
- 401 Unauthorized – when the token is missing or invalid.
- 404 Not Found – when no flashcard is found for the given identifier.
- 500 Internal Server Error – for unexpected server errors.
- Log errors for diagnostics.

### 8. Performance Considerations
- Use indexes on columns `id` and `user_id` to speed up lookups.
- Optimize database queries.

### 9. Implementation Steps
1. Validate the `flashcardId` parameter using Zod.
2. Extend the service function in `src/lib/services/flashcardService.ts` to include a method for fetching flashcard details.
3. Create the endpoint in `src/pages/api/flashcards.ts`.
4. Test and verify the endpoint.

---

## API Endpoint: PUT /flashcards/{flashcardId}

### 1. Endpoint Overview
This endpoint updates an existing flashcard. Editable fields include `front`, `back`, and `is_approved`, with changes to the approval status following business logic.

### 2. Request Details
- **HTTP Method:** PUT  
- **URL Structure:** `/flashcards/{flashcardId}`  
- **Parameters:**
    - **Required:** `flashcardId` (a valid UUID)
- **Request Body:**
    ```json
    {
        "front": "string (max 100 characters)",
        "back": "string (max 100 characters)",
        "is_approved": "boolean"
    }
    ```
    - **Required:** `front`, `back`, `is_approved`

### 3. Data Types Used
- **Command Model:** `UpdateFlashcardCommand` (defined in types.ts)
- **DTO:** The response will include the updated `FlashcardDTO` object

### 4. Response Details
- **Success:**
    - Status: 200 OK
    - JSON with the updated flashcard data
- **Errors:**
    - 400 Bad Request – for invalid input data
    - 401 Unauthorized – missing or invalid JWT token
    - 404 Not Found – flashcard not found
    - 500 Internal Server Error – server error

### 5. Data Flow
1. Receive the request with the `flashcardId` parameter and request body data.
2. Validate `flashcardId` along with `front`, `back` (max 100 characters), and `is_approved` using Zod.
3. Verify user authorization.
4. Invoke the service function to update the flashcard in the database (e.g., using a method in `src/lib/services/flashcardService.ts`).
5. Return the updated `FlashcardDTO` object.

### 6. Security Considerations
- Authenticate via JWT.
- Use RLS to ensure users can update only their own flashcards.
- Validate input data and enforce text length restrictions.

### 7. Error Handling
- 400 Bad Request – for validation errors.
- 401 Unauthorized – when the user is not authenticated.
- 404 Not Found – if the flashcard does not exist.
- 500 Internal Server Error – for unexpected server issues.
- Log detailed error messages.

### 8. Performance Considerations
- The update operation affects only a single row, minimizing database load.
- Use indexes on `id` and `user_id` to quickly locate the record for update.

### 9. Implementation Steps
1. Create/update the validation schema for the PUT request body using Zod.
2. Enhance the service function in `src/lib/services/flashcardService.ts` with an update method.
3. Create the endpoint in `src/pages/api/flashcards.ts` handling the PUT method.
4. Test update scenarios (valid, invalid data, missing record).
5. Update documentation and perform integration tests.
