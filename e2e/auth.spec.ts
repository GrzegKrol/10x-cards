import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/auth/login-page";
import { GroupsPage } from "./pages/groups-page";

test.describe("Authentication", () => {
  let loginPage: LoginPage;
  let groupsPage: GroupsPage;
  const username = process.env.E2E_USERNAME ?? "";
  const password = process.env.E2E_PASSWORD ?? "";

  test.beforeEach(async ({ page }) => {
    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD environment variables must be set");
    }
    loginPage = LoginPage.create(page);
    groupsPage = GroupsPage.create(page);
  });

  test("should login successfully and redirect to groups page", async ({ page }) => {
    // Arrange
    await loginPage.navigate();

    // Act
    await loginPage.login(username, password);

    // Assert
    await expect(page).toHaveURL("/groups");
    await groupsPage.waitForLoading();
    const userEmail = await groupsPage.getUserEmail();
    await expect(userEmail).toHaveText(username);
  });
});
