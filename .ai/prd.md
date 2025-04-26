# User Stories for Flashcards Generation

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
**Description:** This functionality allows users to manually create flashcards with required fields (front, back, creation date, last edit date, assigned user, and group). Each flashcard must belong to a group and can be updated, approved, or deleted.  
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
**Description:** Manages user authentication and authorization. Users log in using their email and password, and registration requires email, password, and confirmation. A logout button is available on every subpage and password recovery is supported.  
**Criteria:**  

- User must authenticate before viewing any groups or flashcards.
- If user enters the direct URL to groups or flashcards view, redirection to the login page happens if user is not authenticated.
- Only flashcards created by the authenticated user can be modified.  
- All actions on groups, flashcards, and AI generation require valid user authentication.  
- User logs in using an email address and password.  
- Registration requires an email address (validated on backend side), password (min 8 char long containing at least one: number, upper and lower case), and password confirmation.
- Logout button is present in the top right corner on every subpage.  
- No integration with external authentication services.  
- Password recovery option is available for registered users.
