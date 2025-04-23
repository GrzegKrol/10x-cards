# API Endpoint Implementation Plan: Flashcards Groups

This document outlines the implementation plan for the Flashcards Groups endpoints:
- GET /groups
- POST /groups
- GET /groups/{group_id}
- PUT /groups/{group_id}

---

## Endpoint: GET /groups

### 1. Endpoint Overview
Retrieves a list of flashcard groups for the authenticated user, supporting pagination and sorting.

### 2. Request Details
- **HTTP Method:** GET  
- **URL Structure:** `/groups`  
- **Query Parameters:**  
    - *Optional:*  
        - `page` (default is 1)  
        - `limit` (default is 20)  
        - `sort` (default is `updated_date`)  
        - `order` (default is `desc`)  
- **Request Body:** None

### 3. Types Used
- **DTO:** `GroupsListDTO` (includes `data: FlashcardGroupDTO[]` and `pagination: PaginationDTO`)
- **FlashcardGroupDTO:** corresponds to the structure in the `flashcards_group` table

### 4. Response Details
- **Success:**  
    - Status code 200 OK  
    - JSON containing the groups data and pagination information  
- **Errors:**  
    - 401 Unauthorized  
    - 500 Internal Server Error

### 5. Data Flow
1. Receive the request with optional parameters.  
2. Validate parameters using Zod.  
3. Verify the JWT token and user authorization (RLS).  
4. Call the service function that fetches data from the database.  
5. Format the result as `GroupsListDTO` and return the response.

### 6. Security Considerations
- JWT token validation.
- Restrict access to data only for the respective user (RLS).
- Input parameter validation.

### 7. Error Handling
- 401 – missing or invalid token.
- 500 – server errors or query execution errors.
- Logging errors with appropriate messages.

### 8. Performance Considerations
- Pagination reduces load.
- Utilize an index on the `updated_date` field.

### 9. Implementation Steps
1. Define the parameter validation schema (using Zod) in `src/lib/schemas/groups.schema.ts`.
2. Implement the service function in `src/lib/services/group.service.ts`.
3. Create the endpoint in `src/pages/api/groups.ts`.
4. Test the endpoint and update the documentation.

---

## Endpoint: POST /groups

### 1. Endpoint Overview
Creates a new flashcard group for the authenticated user.

### 2. Request Details
- **HTTP Method:** POST  
- **URL Structure:** `/groups`  
- **Request Body:**  
    ```json
    {
        "name": "string"
    }
    ```
    - **Required:** `name`
- **Query Parameters:** None

### 3. Types Used
- **Command Model:** `CreateFlashcardGroupCommand` (with field `name`)
- **DTO:** The response will include a `FlashcardGroupDTO` schema

### 4. Response Details
- **Success:**  
    - Status code 201 Created  
    - JSON with the newly created flashcard group data  
- **Errors:**  
    - 400 Bad Request – when `name` is missing or invalid  
    - 401 Unauthorized

### 5. Data Flow
1. Receive the request with the body data.
2. Validate input data using Zod (check the `name` field).
3. Verify user authorization.
4. Invoke the service function to save the new group in the database (considering `user_id` from Supabase).
5. Return a 201 Created response along with the newly created group data.

### 6. Security Considerations
- JWT token validation.
- Restrict group creation function access.
- Validate the length and correctness of the `name` field.

### 7. Error Handling
- 400 – validation error (missing name or incorrect format).
- 401 – unauthorized access.
- 500 – server or database write errors.
- Detailed error logging.

### 8. Performance Considerations
- Optionally check for duplicate group names.
- Minimize the number of database operations.

### 9. Implementation Steps
1. Define the input validation schema in `src/lib/schemas/groups.schema.ts`.
2. Implement the service function for creating groups in `src/lib/services/group.service.ts`.
3. Create the endpoint in `src/pages/api/groups.ts` for the POST method.
4. Test using tools like Postman and update the documentation.

---

## Endpoint: GET /groups/{group_id}

### 1. Endpoint Overview
Retrieves details of a specific flashcard group based on its identifier.

### 2. Request Details
- **HTTP Method:** GET  
- **URL Structure:** `/groups/{group_id}`  
- **URL Parameters:**  
    - `group_id` – required, must be a valid UUID.
- **Request Body:** None

### 3. Types Used
- **DTO:** `FlashcardGroupDTO` – detailed flashcard group data

### 4. Response Details
- **Success:**  
    - Status code 200 OK  
    - JSON with the flashcard group’s details  
- **Errors:**  
    - 401 Unauthorized  
    - 404 Not Found – when a group with the given `group_id` does not exist

### 5. Data Flow
1. Receive the request with the `group_id` parameter.
2. Validate the `group_id` format (UUID) using Zod.
3. Verify user authorization.
4. Call the service function to fetch the group data from the database, filtering by `user_id`.
5. Return the group object or an appropriate error.

### 6. Security Considerations
- JWT token validation.
- Restrict access using RLS so that the user only sees their own groups.
- Validate the `group_id` identifier.

### 7. Error Handling
- 401 – invalid or missing token.
- 404 – group not found.
- 500 – server errors.
- Log errors to facilitate diagnostics.

### 8. Performance Considerations
- Optimize database queries by indexing columns used for searching.

### 9. Implementation Steps
1. Define validation for `group_id` (UUID) in `src/lib/schemas/groups.schema.ts`.
2. Implement the service function in `src/lib/services/group.service.ts` to fetch group details.
3. Create the endpoint in `src/pages/api/groups/[groupId].ts`.
4. Test the endpoint and update the documentation.

---

## Endpoint: PUT /groups/{group_id}

### 1. Endpoint Overview
Updates the name of an existing flashcard group for the authenticated user.

### 2. Request Details
- **HTTP Method:** PUT  
- **URL Structure:** `/groups/{group_id}`  
- **URL Parameters:**  
    - `group_id` – required, must be a valid UUID.
- **Request Body:**  
    ```json
    {
        "name": "string"
    }
    ```
    - **Required:** `name` (valid format)
- **Query Parameters:** None

### 3. Types Used
- **Command Model:** `UpdateFlashcardGroupCommand` (used mainly for updating the `name` field)
- **DTO:** Updated `FlashcardGroupDTO` object

### 4. Response Details
- **Success:**  
    - Status code 200 OK  
    - JSON with the updated group data
- **Errors:**  
    - 400 Bad Request – validation errors, e.g., incorrect format of the `name` field
    - 401 Unauthorized  
    - 404 Not Found – when a group with the given `group_id` is not found

### 5. Data Flow
1. Receive the request with `group_id` and the body data.
2. Validate both the `group_id` (UUID) and input data (`name`) using Zod.
3. Verify the JWT token and restrict access using RLS.
4. Call the service function to update the database.
5. Return the updated group object or an appropriate error.

### 6. Security Considerations
- JWT token validation.
- Restrict modifications to the group's owner.
- Validate input data.

### 7. Error Handling
- 400 – input validation error.
- 401 – missing or invalid token.
- 404 – group not found.
- 500 – database write or server error.
- Detailed logging of errors.

### 8. Performance Considerations
- The update should be lightweight – only one column is updated.
- Optimize queries by using indexes on `id` and `user_id`.

### 9. Implementation Steps
1. Define validation for `group_id` and Request Body in `src/lib/schemas/groups.schema.ts`.
2. Implement the service function in `src/lib/services/group.service.ts` to update the group.
3. Create the endpoint in `src/pages/api/groups/[groupId].ts` handling the PUT method.
4. Test the endpoint in various scenarios (valid data, invalid data, non-existent group).
5. Update the API documentation.
