# Group Details View Implementation Plan

## 1. Overview
This view shows detailed information about a selected group. It allows editing of the group name, AI-powered flashcard generation, and manual flashcard addition. The view features inline validation and a polling mechanism for refreshing flashcards.

## 2. View Routing
Accessible at route: `/groups/[groupId]`

## 3. Component Structure
- GroupDetailsPage (container)
  - Header with breadcrumbs
  - GroupInfoSection (editable group name, last used prompt, cards count)
  - AIGenerationForm (to generate AI flashcards)
  - FlashcardsList (list of flashcards in the group)
  - AddFlashcardButton (triggers manual flashcard modal)
  - FlashcardModal (form popup for manual flashcard creation)

## 4. Component Details
### GroupInfoSection
- **Description:** Displays and allows editing of group name and AI prompt details.
- **Main Elements:** Editable text fields, inline validation.
- **Events:** onChange, onSave to trigger PUT API for group updates.
- **Types:** UpdateGroupCommand.
- **Props:** GroupDTO data.

### AIGenerationForm
- **Description:** Form to send AI prompt and specify flashcards count.
- **Main Elements:** Textarea for prompt (max 1000 chars), numeric input for count.
- **Events:** onSubmit to call AI flashcards API.
- **Validation:** Prompt length (min 50, up to 1000) and count (max 50).
- **Types:** AICreateFlashcardCommand.
- **Props:** Group id, callbacks to update group info.

### FlashcardsList
- **Description:** Renders a list of flashcards sorted by updated date.
- **Events:** Periodic polling to refresh flashcards.
- **Types:** FlashcardsListDTO.
- **Props:** Array of flashcards.

### FlashcardModal
- **Description:** Modal form for manual flashcard addition.
- **Main Elements:** Front text, back text inputs; save and cancel buttons.
- **Events:** onSubmit calls POST API for flashcard creation.
- **Validation:** Max 100 characters for front and back.
- **Types:** CreateFlashcardCommand.
- **Props:** Visibility flag, callbacks for save/cancel.

## 5. Types
- GroupDTO (as defined previously)
- FlashcardDTO with fields (id, front, back, source, is_approved, etc.)
- UpdateGroupCommand and AICreateFlashcardCommand from types.ts

## 6. State Management
Local state includes:
- Group details and flashcards array
- Polling state/interval for refresh
- Form states for edit and AI generation
- Modal visibility flag
Custom hooks (e.g., useGroupDetails) could encapsulate fetching and state management.

## 7. API Integration
- **GET** `/api/groups/[groupId]` to fetch group details.
- **PUT** `/api/groups/[groupId]` to update group name/details.
- **POST** `/api/flashcards/ai` for AI flashcard generation.
- **POST** `/api/flashcards` for manual flashcard creation.

## 8. User Interactions
- Edit group name instantly triggers a PUT on blur or save click.
- Submit AI prompt to generate flashcards; new flashcards update the list.
- Manual flashcard modal opens, validates input, and refreshes list on save.

## 9. Conditions and Validation
- Validate group name not empty.
- Validate AI prompt length and flashcard count.
- Validate manual flashcard input (front/back limits).
- Inline error messages shown for each form.

## 10. Error Handling
- Display specific error messages for API failures.
- Use guard clauses to abort invalid submissions.
- Log errors for backend debugging.

## 11. Implementation Steps
1. Build the GroupDetailsPage routing with parameter extraction.
2. Implement GroupInfoSection for editing group details.
3. Develop AIGenerationForm with input validations and API integration.
4. Create FlashcardsList with polling functionality.
5. Build FlashcardModal for manual flashcard creation.
6. Integrate state management via custom hooks.
7. Test all interactions for accessibility and responsiveness.
