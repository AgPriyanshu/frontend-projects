import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/login.page";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders login form with all required fields", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test("shows validation errors for empty submission", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submitButton.click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailInput.fill("not-an-email");
    await login.passwordInput.fill("password123");
    await login.submitButton.click();

    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test("shows validation error for password shorter than 8 characters", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailInput.fill("user@example.com");
    await login.passwordInput.fill("short");
    await login.submitButton.click();

    await expect(
      page.getByText(/password must be at least 8 characters/i)
    ).toBeVisible();
  });

  test("redirects to home on successful login", async ({ page }) => {
    // Mock the login API to return a valid token.
    await page.route("**/auth/login/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          meta: {
            status_code: 200,
            success: true,
            message: "Login successful",
          },
          data: { token: "mock-auth-token" },
        }),
      });
    });

    // Also mock the home page data calls so the app doesn't error.
    await page.route("**/*", async (route) => {
      if (route.request().resourceType() === "fetch") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ meta: { success: true }, data: [] }),
        });
      } else {
        await route.continue();
      }
    });

    const login = new LoginPage(page);
    await login.goto();
    await login.login("user@example.com", "password123");

    await expect(page).toHaveURL("/");
  });
});
