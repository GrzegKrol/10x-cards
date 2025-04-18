# Product Requirements Document Summary

## Decisions
1. The main problem is the time consumption of manually creating flashcards.
2. The product must allow both AI-generated and manual flashcard creation.
3. A flashcard must contain the following fields: front, back, creation date, last edit date, assignment to a user and a group, and an indication of the creation method (a boolean value).
4. Flashcard groups can have identical names but must possess unique IDs; the user can add, delete, view, and edit group names.
5. The AI flashcard generation interface should include a text field (with a limit of 1000 characters) and an option to select the number of flashcards to generate (maximum 20); these restrictions must be visible to the user. Additionally, when a user enters a group interface, fields for the AI prompt must be provided, and the most recent text field value along with the selected number of flashcards should be stored in the database.
6. Manually created flashcards are automatically approved, whereas those generated by AI require user acceptance.
7. The system must validate input data – if the user exceeds the character limit or the number of flashcards, an error message is displayed and detailed error information is logged to a file.
8. The user’s password must be at least 8 characters long and contain a digit; it will be stored as an encoded string.

## Matched Recommendations
1. Define a detailed data structure for flashcards that includes all the required fields.
2. Develop an intuitive interface for AI flashcard generation with clear restrictions (1000 characters, 20 flashcards) and incorporate storage for the most recent AI prompt input and flashcard count.
3. Implement an input data validation mechanism along with detailed error logging.
4. Design the workflow for creating, editing, and approving flashcards in accordance with MVP requirements.
5. Establish security requirements, including password validation and secure storage of user data.

## PRD Planning Summary
The product aims to solve the issue of time-consuming manual flashcard creation. It allows users to create flashcards both manually and via AI. Each flashcard includes the following fields: front, back, creation date, last edit date, a boolean flag indicating if it was generated by AI, and an assignment to a specific user and group. The AI flashcard generation interface is equipped with a text field (up to 1000 characters) and an option to choose the number of flashcards to generate (maximum 20). In addition, when users access a group's interface, they are provided with fields for the AI prompt, and the most recently entered text along with the number of flashcards to generate is stored in the database. Manually created flashcards are automatically approved, whereas AI-generated flashcards require user approval. The system validates input data and displays detailed error messages (which are also logged) if limits are exceeded. Registration is performed using a login and a password (minimum 8 characters, containing at least one digit). The flashcard group management functionality allows adding, deleting, viewing, and editing group names, with each group having a unique ID even if names are duplicated.

## Unresolved Issues
There are no unresolved issues – all aspects have been precisely specified.
