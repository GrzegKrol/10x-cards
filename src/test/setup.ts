import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Setup MSW server for API mocking
export const server = setupServer(...handlers);

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Clean up after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());
