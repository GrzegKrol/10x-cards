# User Stories dla projektu Flashcards Generation

## 1. Flashcard Groups

**Title:** Flashcard Groups  
**Description:** This functionality supports managing flashcard groups. Users can add, delete, view, and edit group names. Each group is assigned a unique ID even if names are duplicated. Additionally, users can delete all flashcards belonging to a group.  
**Criteria:**  

- Ability to add new groups.
- Ability to delete, view, and edit existing groups.  
- Each group has a unique ID irrespective of duplicate names.  
- Option to delete all flashcards associated with a group.

## 2. Flashcards

**Title:** Flashcards  
**Description:** This functionality allows users to manually create flashcards by providing necessary fields (front, back, creation date, last edit date, assigned user, and group). Every flashcard must belong to a group. Manual flashcards are auto-approved but can also be updated, approved, and deleted.  
**Criteria:**  

- User can input required fields for flashcards.
- Each flashcard must be associated with a group.  
- Flashcards created manually are automatically approved.  
- Flashcards can be updated, approved, and deleted.

## 3. Flashcards UI Generation

**Title:** Flashcards UI Generation  
**Description:** This feature enables AI-assisted flashcard creation. It includes a text field limited to 1000 characters for the AI prompt and an option to select up to 50 flashcards to generate. AI-generated flashcards require user approval, and the system saves the most recent prompt along with the flashcard count when entering a group.  
**Criteria:**  

- Text field accepts a maximum of 1000 characters.
- Option to select up to 50 flashcards for generation.  
- AI-generated flashcards require user confirmation.  
- Last entered AI prompt and flashcard count are stored when accessing group interfaces.

## 4. Security

**Title:** Security  
**Description:** This functionality ensures that access to flashcard groups, flashcards, and AI generation features is secured. Users must authenticate before accessing any content. After login, users can perform all actions from sections 1, 2, and 3; however, they are only permitted to modify flashcards that they personally created.  
**Criteria:**  

- User must authenticate before viewing any groups or flashcards.
- Only flashcards created by the authenticated user can be modified.  
- All actions on groups, flashcards, and AI generation require valid user authentication.
