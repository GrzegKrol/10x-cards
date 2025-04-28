import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/auth/login-page";

const username = process.env.E2E_USERNAME ?? "";
const password = process.env.E2E_PASSWORD ?? "";

setup("authenticate", async ({ page }) => {
  // Validate environment variables
  if (!username || !password) {
    throw new Error("Required environment variables are not set");
  }

  // Perform login
  const loginPage = LoginPage.create(page);
  await loginPage.navigate();
  await loginPage.login(username, password);
  await expect(page).toHaveURL("/groups");

  // Store authentication state
  await page.context().storageState({ path: "./e2e/.auth/user.json" });
});
