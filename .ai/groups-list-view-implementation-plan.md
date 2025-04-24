# Groups List View Implementation Plan

## 1. Overview
This view displays a list of the user's flashcard groups in descending order by updated date. It includes a form for adding a new group and navigational elements such as breadcrumbs and a logout button.

## 2. View Routing
Accessible at route: `/groups`

## 3. Component Structure
- GroupsListPage (container)
  - Header (with Logout button and breadcrumbs)
  - GroupsList (displays GroupCard items)
  - AddGroupForm (modal or inline form)
  - GroupCard (individual group representation)

## 4. Component Details
### GroupsListPage
- **Description:** Page layout for the groups view.
- **Main Elements:** Aggregates header, group list, and add group functionality.
- **Events:** Fetch groups on mount; pass down props.
- **Types:** GroupsListViewModel from API response.
- **Props:** None; uses internal API hook.

### AddGroupForm
- **Description:** Input form to add a new group.
- **Main Elements:** Input (for group name), submit button.
- **Events:** onChange, onSubmit to validate and POST to API.
- **Validation:** Name must be non-empty.
- **Types:** CreateGroupCommand.
- **Props:** Callback to update the list post-creation.

### GroupCard
- **Description:** Displays group details such as name and updated date.
- **Events:** Click event to navigate to Group Details view.

## 5. Types
- GroupDTO:
  - id: string
  - name: string
  - creation_date: string
  - updated_date: string
  - last_used_prompt?: string | null
  - last_used_cards_count?: number
- GroupsListDTO:
  - data: name, created_date, updated_date from GroupDTO[]
  - pagination: { page: number; limit: number; total: number }

## 6. State Management
Local state includes:
- groups: GroupDTO[]
- loading flag
- error state
- Input state for new group
A custom hook (e.g., useGroups) can manage fetching and state updates.

## 7. API Integration
- **GET** `/api/groups` for fetching group list.
- **POST** `/api/groups` for creating a new group.
- **Request/Response Types:** Use GroupsListDTO and CreateGroupCommand.

## 8. User Interactions
- On load, groups are fetched and rendered.
- Clicking "Add Group" opens the form; submission refreshes the list.
- Each group card is clickable to navigate to details.

## 9. Conditions and Validation
- Validate group name before creation.
- Handle API errors gracefully with inline messages.

## 10. Error Handling
- Display error notifications for API failures.
- Validate input immediately and display inline error messages.
- Log network errors for debugging.

## 11. Implementation Steps
1. Create and wire up the GroupsListPage with routing.
2. Implement Header with breadcrumbs and logout functionality.
3. Build GroupsList and GroupCard components to display data.
4. Develop AddGroupForm with input validation and POST integration.
5. Use a custom hook to fetch groups and update state.
6. Test responsiveness and accessibility adjustments.
