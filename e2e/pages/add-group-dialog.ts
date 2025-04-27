import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class AddGroupDialog extends BasePage {
  async waitForDialog(): Promise<void> {
    await this.waitForTestId("add-group-dialog");
  }

  async fillGroupName(name: string): Promise<void> {
    const input = await this.waitForTestId("group-name-input");
    await input.fill(name);
  }

  async getErrorMessage(): Promise<string | null> {
    const error = this.getByTestId("group-name-error");
    if (await error.isVisible()) {
      return error.textContent();
    }
    return null;
  }

  async submit(): Promise<void> {
    const submitButton = await this.waitForTestId("submit-group-button");
    await submitButton.click();
    // Wait for the dialog to close
    const dialog = this.getByTestId("add-group-dialog");
    await expect(dialog).not.toBeVisible();
  }

  async cancel(): Promise<void> {
    const cancelButton = await this.waitForTestId("cancel-group-button");
    await cancelButton.click();
    // Wait for the dialog to close
    const dialog = this.getByTestId("add-group-dialog");
    await expect(dialog).not.toBeVisible();
  }

  async createGroup(name: string): Promise<void> {
    await this.waitForDialog();
    await this.fillGroupName(name);
    await this.submit();
  }
}
