# 10x-cards

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
10x-cards is a flashcard generation application designed to streamline the creation process by integrating both manual and AI-assisted flashcard creation. Users can generate flashcards using an AI interface—complete with text input and configurable flashcard count—or create them manually. Key functionalities include input validation, detailed error logging, and secure user management.

## Tech Stack
- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- **Backend:** Supabase for database and authentication services
- **AI:** Integration with Openrouter.ai for accessing multiple models

## Getting Started Locally
1. Ensure you have Node.js version defined in [`.nvmrc`](./.nvmrc) (22.14.0).
2. Clone the [repository](https://github.com/GrzegKrol/10x-cards)

3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts
- `npm run dev` – Start the Astro development server.
- `npm run build` – Build the project for production.
- `npm run preview` – Preview the built project.
- `npm run astro` – Run Astro CLI commands.
- `npm run lint` – Lint the project files.
- `npm run lint:fix` – Automatically fix lint issues.
- `npm run format` – Format the codebase using Prettier.

## Project Scope
- **Flashcard Creation:** Supports both AI-generated and manual flashcards.
- **Flashcard Details:** Each flashcard includes the front, back, creation date, last edit date, user and group associations, and an indicator for AI generation.
- **AI Interface:** Features a text input (max 1000 characters) and a selector for generating up to 20 flashcards.
- **Validation:** Input data is validated with error messages displayed and detailed logs maintained.
- **Group Management:** Allows adding, deleting, viewing, and editing groups with unique IDs.
- **User Registration:** Enforces password strength criteria (minimum 8 characters with at least 1 digit), with secure storage of credentials.

## Project Status
Currently in active development with an MVP that addresses core functionalities as outlined in the product requirements.

## License
This project is licensed under the MIT License.
