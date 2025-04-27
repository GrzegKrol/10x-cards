import { test, expect } from "@playwright/test";

test("homepage has title and welcome message", async ({ page }) => {
  await page.goto("/");

  // Check page title
  await expect(page).toHaveTitle(/10x Cards/);

  // Check welcome message
  const welcome = page.getByRole("heading", { level: 1 });
  await expect(welcome).toBeVisible();
});

test("navigation to groups page works", async ({ page }) => {
  await page.goto("/");

  // Click groups link
  await page.getByRole("link", { name: /groups/i }).click();

  // Should be redirected to groups page
  await expect(page).toHaveURL("/groups");
});
