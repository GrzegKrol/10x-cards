# Test info

- Name: login validation
- Location: /Users/krolg/Workspace/exercise/10x-dev/10x-cards/e2e/home.spec.ts:40:1

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: getByTestId('login-button')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for getByTestId('login-button')

    at LoginPage.waitForTestId (/Users/krolg/Workspace/exercise/10x-dev/10x-cards/e2e/pages/base-page.ts:19:27)
    at LoginPage.clickSignIn (/Users/krolg/Workspace/exercise/10x-dev/10x-cards/e2e/pages/auth/login-page.ts:45:37)
    at /Users/krolg/Workspace/exercise/10x-dev/10x-cards/e2e/home.spec.ts:45:19
```

# Page snapshot

```yaml
- main:
  - link "10x Cards":
    - /url: /
  - text: Sign In Sign in to your account to access your flashcards Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - button "Sign In"
  - link "Create account":
    - /url: /auth/register
  - link "Forgot password?":
    - /url: /auth/reset-password
```

# Test source

```ts
   1 | import { expect } from "@playwright/test";
   2 | import type { Page, Locator } from "@playwright/test";
   3 |
   4 | export abstract class BasePage {
   5 |   protected constructor(protected readonly page: Page) {}
   6 |
   7 |   protected async waitForLocator(selector: string): Promise<Locator> {
   8 |     const locator = this.page.locator(selector);
   9 |     await expect(locator).toBeVisible({ timeout: 10000 });
  10 |     return locator;
  11 |   }
  12 |
  13 |   protected getByTestId(testId: string): Locator {
  14 |     return this.page.getByTestId(testId);
  15 |   }
  16 |
  17 |   protected async waitForTestId(testId: string): Promise<Locator> {
  18 |     const locator = this.getByTestId(testId);
> 19 |     await expect(locator).toBeVisible({ timeout: 10000 });
     |                           ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  20 |     return locator;
  21 |   }
  22 | }
  23 |
```