# UI Summary

## Conversation Summary

### Decisions
1. The main views include: a login screen; a "Groups View" displaying a list of groups with an option to create a new group; a "Group Details" screen that supports AI flashcard generation, manual flashcard addition, and displays a list of flashcards; and a "Flashcard Details" screen for previewing and editing individual flashcards.
2. After login, the user will be automatically redirected to the Groups View.
3. Flashcards within a group should be fetched immediately after each modification action using a polling mechanism.
4. Breadcrumbs will be dynamically generated from existing API endpoint data without making additional API calls. Section placed in the header at the left-right corner
5. JWT-based authentication is used; when the session expires, the user is redirected to the login screen.
6. A visible "Logout" button will be placed in the header at the top-right corner, visible only for logged-in users.
7. Flashcards in the list will be sorted in descending order by the "updatedDate" field.
8. Groups in the list will be sorted in descending order by the "updatedDate" field. It is also possible to sort by name.

### Matched Recommendations
1. Create separate views: login screen; groups list view; group details view (with AI generation, manual addition, group name edit, and flashcards list sorted by "updatedDate"); and flashcard details view where update is possible.
2. Design a navigation system using dynamic breadcrumbs (e.g., "home > group {id} > flashcard {id}") to reflect the user's current location accurately.
3. Implement automatic redirection to the Groups View immediately after a successful login.
4. Use a polling mechanism to refresh the flashcards list immediately after any modifications.
5. Display inline error messages on the same screen where the error occurs, allowing users to correct form inputs.
6. Integrate JWT-based authentication with automatic redirection to the login screen upon session expiration.
7. Utilize Shadcn/ui components to develop a consistent, responsive UI, including an easily accessible logout button in the header.

### UI Architecture Planning Summary
1. Focus on handling user login, managing flashcard groups (creation, listing, detailed view), and individual flashcards (preview and editing).
2. Key user flows:
    - Upon login, users access the groups list.
    - Selecting a group opens the group details screen with options to generate flashcards via AI or add them manually or edit group name.
    - Clicking a flashcard opens its details for preview and editing.
3. API integration uses existing endpoints for managing users, groups, and flashcards; a polling mechanism ensures the UI remains up to date after modifications.
4. Error handling is conducted inline on the same screen as the form, allowing for quick correction of validation errors.
5. The application is responsive on both desktop and mobile devices using Tailwind CSS for styling.
6. Security is maintained via JWT-based authentication; upon session expiration, the UI automatically redirects to the login screen, supported by a visible logout button for active sessions.
