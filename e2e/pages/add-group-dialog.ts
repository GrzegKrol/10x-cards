import { BasePage } from "./base-page";

export class AddGroupDialog extends BasePage {
  async createGroup(name: string): Promise<void> {
    const nameInput = this.getByTestId("group-name-input");
    await nameInput.fill(name);

    const submitButton = this.getByTestId("create-group-button");
    await submitButton.click();
  }
}
