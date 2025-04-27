import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { BasePage } from "../base-page";

export class LoginPage extends BasePage {
  readonly url = "/auth/login";

  static create(page: Page): LoginPage {
    return new LoginPage(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState("networkidle");
    await this.waitForForm();
  }

  private async waitForForm(): Promise<void> {
    const form = this.page.locator("form");
    await expect(form).toBeVisible({ timeout: 10000 });
    // Additional wait to ensure form elements are interactive
    await this.page.waitForLoadState("domcontentloaded");
  }

  async fillEmail(email: string): Promise<void> {
    const emailInput = await this.waitForTestId("email-input");
    await emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    const passwordInput = await this.waitForTestId("password-input");
    await passwordInput.fill(password);
  }

  async getErrorMessage(): Promise<string | null> {
    const error = this.getByTestId("login-error");
    if (await error.isVisible()) {
      return error.textContent();
    }
    return null;
  }

  async clickSignIn(): Promise<void> {
    const submitButton = await this.waitForTestId("login-button");
    await submitButton.click();
  }

  async clickCreateAccount(): Promise<void> {
    await this.page.getByRole("link", { name: "Create account" }).click();
    await expect(this.page).toHaveURL("/auth/register");
  }

  async clickForgotPassword(): Promise<void> {
    await this.page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(this.page).toHaveURL("/auth/reset-password");
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
    // Wait for successful login and redirect
    await expect(this.page).toHaveURL("/groups");
  }

  async expectValidationError(expectedError: string): Promise<void> {
    const error = await this.getErrorMessage();
    expect(error).toBe(expectedError);
  }

  async expectLoginButtonState(expectedState: { disabled?: boolean; loading?: boolean }): Promise<void> {
    const button = this.getByTestId("login-button");
    if (expectedState.disabled !== undefined) {
      await expect(button).toHaveAttribute("disabled", String(expectedState.disabled));
    }
    if (expectedState.loading !== undefined) {
      const text = await button.textContent();
      expect(text?.includes("Signing in")).toBe(expectedState.loading);
    }
  }
}
