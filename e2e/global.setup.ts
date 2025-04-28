import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/auth/login-page";
import { getValidatedEnvProperties } from "./types";

setup("authenticate", async ({ page }) => {
  const env = getValidatedEnvProperties();

  // Perform login
  const loginPage = LoginPage.create(page);
  await loginPage.navigate();
  await loginPage.login(env.email, env.password);
  await expect(page).toHaveURL("/groups");

  // Store authentication state
  await page.context().storageState({ path: "./e2e/.auth/user.json" });
});
