import { test } from "@playwright/test";

/**
 * Logs an error message in the test context
 * @param message The error message to log
 */
export function logError(message: string): void {
  test.info().annotations.push({ type: "error", description: message });
}

/**
 * Logs an info message in the test context
 * @param message The info message to log
 */
export function logInfo(message: string): void {
  test.info().annotations.push({ type: "info", description: message });
}
