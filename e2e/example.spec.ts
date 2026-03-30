import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // You can update this regex with the actual title of your app
  await expect(page).toHaveTitle(/./);
});
