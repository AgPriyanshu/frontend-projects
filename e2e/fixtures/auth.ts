import { test as base, expect } from "@playwright/test";

const MOCK_TOKEN = "mock-auth-token";

/**
 * Authentication fixture that bypasses the login screen for tests
 * that require an authenticated session. Seeds localStorage with a
 * valid token so ProtectedRoute lets the test through.
 */
export const test = base.extend({
  page: async ({ page }, runFixture) => {
    // Seed the token before the app boots so ProtectedRoute passes on first render.
    await page.addInitScript((token) => {
      localStorage.setItem("accessToken", token);
    }, MOCK_TOKEN);

    await runFixture(page);
  },
});

export { expect };
export { MOCK_TOKEN };
