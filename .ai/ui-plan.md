# UI Architecture for 10x-cards

## 1. Overview of the UI Structure
The user interface is composed of several main views designed for fast and intuitive navigation. Each view corresponds to specific operations: login, managing flashcard groups (creating, editing, previewing), and viewing/editing individual flashcards. The system is built using Shadcn/ui components, featuring a responsive layout (Tailwind CSS) and JWT-based security.

## 2. List of Views

### Login View
- **View Path:** `/login`
- **Primary Purpose:** Allows users to authenticate and gain access to the application.
- **Key Information Displayed:** Login form (email, password) with data validation; inline error messages.
- **Key Components:** Form, buttons, error message displays, JWT handling.
- **UX, Accessibility, and Security:** Simplicity, quick data validation, screen reader support (ARIA), secure transmission of login credentials.

### Groups List View
- **View Path:** `/groups`
- **Primary Purpose:** Display a list of existing flashcard groups and enable the creation of new groups.
- **Key Information Displayed:** List of groups (sorted in descending order by updatedDate), dynamic breadcrumbs, and an "Add Group" button.
- **Key Components:** Group cards, group creation form, navigational elements (breadcrumbs), logout button in the header.
- **UX, Accessibility, and Security:** Intuitive group presentation, quick access to the creation function, responsive layout, easy access to the logout button.

### Group Details View
- **View Path:** `/groups/[groupId]`
- **Primary Purpose:** Present detailed information about a selected group, allow editing of the group name, AI-based flashcard generation, and manual flashcard addition.
- **Key Information Displayed:** Group name, last used prompt, number of flashcards, list of flashcards (sorted in descending order by updatedDate), fields for AI flashcard generation, and manual flashcard addition button showing a flashcard form popup with save and cancel buttons.
- **Key Components:** Forms (editing group name, AI flashcard generation), manual flashcard addition button, flashcard list, inline error messages, dynamic breadcrumbs.
- **UX, Accessibility, and Security:** Immediate refresh of the flashcard list (polling mechanism), inline error message handling, clear navigation and ease of modifications.

### Flashcard Details View
- **View Path:** `/groups/[groupId]/flashcards/[flashcardId]`
- **Primary Purpose:** Allow the user to view detailed flashcard information and edit it.
- **Key Information Displayed:** Front text, back text, creation and last modification dates, approval status (manual vs. AI).
- **Key Components:** Edit form, save buttons, navigational elements (breadcrumbs) indicating location.
- **UX, Accessibility, and Security:** Clarity of information, clear validation messages, data protection with JWT, responsive design.

## 3. User Journey Map
1. **Login:** The user opens the login page (`/login`) and enters authentication details. Upon successful validation, the user is redirected to the groups list view.
2. **Groups List:** The user sees a list of their flashcard groups with dynamically generated breadcrumbs and can either select an existing group or create a new one.
3. **Group Details:** Once a group is selected, the user is taken to the group details view (`/groups/[groupId]`). Here, they can edit the group name, trigger AI-based flashcard generation, add a flashcard manually, or review existing flashcards. All modifications are immediately reflected thanks to the polling mechanism.
4. **Flashcard Details:** Clicking on a specific flashcard takes the user to the flashcard details view (`/groups/[groupId]/flashcards/[flashcardId]`), where the flashcard content can be edited and modification history viewed.
5. **Navigation and Logout:** Breadcrumbs assist the user at every step of navigation, and the logout button in the header (visible for authenticated users) allows for quick session termination if needed.

## 4. Navigation Layout and Structure
- **Breadcrumbs:** Dynamically generated based on the current API context, displayed in the header on the left, showing the hierarchy (e.g., "home > group {name} > flashcard {id}").
- **Header Menu:** Includes a logout button (visible only for logged-in users) in the top right corner.
- **Redirects:** Automatic redirection after login to the groups list view and automatic data refresh in detailed views via the polling mechanism.
- **Responsiveness:** Navigation and all UI elements are optimized for both desktop and mobile devices using Tailwind CSS.

## 5. Key Components
- **Forms:** Used for login, group creation, group name editing, flashcard addition and editing, and AI-based flashcard generation. They provide data validation and inline error messaging.
- **Lists/Cards:** Components for displaying lists of groups and flashcards, with sorting based on the `updatedDate` field.
- **Navigational Components:** Header with dynamic breadcrumbs and a logout button.
- **Polling Mechanism:** Ensures immediate data refresh after modification operations.
- **Shadcn/ui Components:** Provide a consistent, aesthetically pleasing, and responsive user interface across the application.
