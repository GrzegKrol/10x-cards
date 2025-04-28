import { test, expect } from "@playwright/test";
import { GroupsPage } from "./pages/groups-page";

test.describe("Groups List", () => {
  let groupsPage: GroupsPage;
  const userEmail = process.env.E2E_USERNAME ?? "";

  test.beforeEach(async ({ page }) => {
    if (!userEmail) {
      throw new Error("E2E_USERNAME environment variable must be set");
    }

    // Since we're using the global setup for authentication,
    // we just need to create the page and navigate
    groupsPage = GroupsPage.create(page);
  });

  test("should display authenticated user email in header", async () => {
    // Arrange & Act
    await groupsPage.navigate();

    // Assert
    await groupsPage.verifyUserEmail(userEmail);
  });

  test("should show empty state when no groups exist", async () => {
    // Arrange & Act
    await groupsPage.navigate();
    await groupsPage.waitForLoading();

    // Assert
    expect(await groupsPage.isEmptyState()).toBeTruthy();
  });

  test("should create a new group and navigate to its details", async () => {
    // Arrange
    await groupsPage.navigate();
    await groupsPage.waitForLoading();
    const groupName = "Playwright for testing";

    // Act
    const dialog = await groupsPage.clickAddGroupButton();
    await dialog.createGroup(groupName);

    // Assert
    // Verify the group exists and we're on its details page
    const group = await groupsPage.getGroupByName(groupName);
    expect(group).not.toBeNull();
  });
});
