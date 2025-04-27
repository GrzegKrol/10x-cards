import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export abstract class BasePage {
  readonly timeout = 5000;

  protected constructor(protected readonly page: Page) {}

  protected async waitForLocator(selector: string): Promise<Locator> {
    const locator = this.page.locator(selector);
    await expect(locator).toBeVisible({ timeout: this.timeout });
    return locator;
  }

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected async waitForTestId(testId: string): Promise<Locator> {
    const locator = this.getByTestId(testId);
    await expect(locator).toBeVisible({ timeout: this.timeout });
    return locator;
  }

  async getUserEmail(waitForVisible = true): Promise<Locator> {
    const locator = this.getByTestId("user-email");
    if (waitForVisible) {
      await expect(locator).toBeVisible({ timeout: this.timeout });
    }
    return locator;
  }
}
