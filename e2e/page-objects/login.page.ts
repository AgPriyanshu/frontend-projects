import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the Login page (/login).
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("Enter your email");
    this.passwordInput = page.getByPlaceholder("Enter your password");
    this.submitButton = page.getByRole("button", { name: /sign in/i });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getFieldError(field: "email" | "password") {
    // Chakra UI Field.ErrorText renders in a sibling element.
    const input = field === "email" ? this.emailInput : this.passwordInput;
    return input.locator("..").locator("..");
  }
}
