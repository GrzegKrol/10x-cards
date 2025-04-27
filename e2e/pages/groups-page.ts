import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";
import { AddGroupDialog } from "./add-group-dialog";

export class GroupsPage extends BasePage {
  readonly url = "/groups";

  static create(page: Page): GroupsPage {
    return new GroupsPage(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForTestId("groups-container");
  }

  async waitForLoading(): Promise<void> {
    const loading = this.getByTestId("groups-loading");
    await expect(loading).toBeVisible();
    await expect(loading).not.toBeVisible();
  }

  async clickAddGroupButton(): Promise<AddGroupDialog> {
    const button = await this.waitForTestId("add-group-button");
    await button.click();
    return new AddGroupDialog(this.page);
  }

  async getGroupsList(): Promise<Locator> {
    return this.waitForTestId("groups-list");
  }

  async getGroupByName(name: string): Promise<Locator | null> {
    const groups = await this.getGroupsList();
    const groupItems = await groups.locator('[data-testId^="group-item-"]').all();

    for (const item of groupItems) {
      const text = await item.textContent();
      if (text?.includes(name)) {
        return item;
      }
    }
    return null;
  }

  async isEmptyState(): Promise<boolean> {
    const emptyState = this.getByTestId("groups-empty");
    return await emptyState.isVisible();
  }

  async hasError(): Promise<boolean> {
    const error = this.getByTestId("groups-error");
    return await error.isVisible();
  }

  async retryLoadingOnError(): Promise<void> {
    if (await this.hasError()) {
      const retryButton = this.getByTestId("groups-retry");
      await retryButton.click();
      await this.waitForLoading();
    }
  }
}
