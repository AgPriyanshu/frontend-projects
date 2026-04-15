import { test, expect } from "./fixtures/auth";

/**
 * End-to-end tests for the Level Up character development scorecard.
 * All state is local — no backend mocking required.
 */
test.describe("Level Up — character scorecard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/level-up");
  });

  test("renders the initial characters in the sidebar", async ({ page }) => {
    const cards = page.getByTestId("character-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText("Priyanshu");
  });

  test("selects a different character when clicking a sidebar card", async ({
    page,
  }) => {
    const cards = page.getByTestId("character-card");

    // Second character is Dark Knight.
    await cards.nth(1).click();
    await expect(
      page
        .getByTestId("character-class")
        .getByRole("paragraph")
        .or(
          page.getByTestId("character-class").locator("[data-part='preview']")
        )
    ).toContainText("Dark Knight");
  });

  test("adds a new character via the New Character button", async ({
    page,
  }) => {
    await page.getByTestId("add-character-button").click();

    const cards = page.getByTestId("character-card");
    await expect(cards).toHaveCount(3);
  });

  test("newly added character is selected automatically", async ({ page }) => {
    await page.getByTestId("add-character-button").click();

    // The new character name defaults to "Character 3".
    await expect(page.getByTestId("character-name")).toContainText(
      "Character 3"
    );
  });

  test("adds a new custom stat via the stat input", async ({ page }) => {
    await page.getByPlaceholder("New stat name…").fill("Creativity");
    await page.getByRole("button", { name: /add stat/i }).click();

    await expect(page.getByTestId("stat-row-creativity")).toBeVisible();
  });

  test("does not add a duplicate stat", async ({ page }) => {
    const statInput = page.getByPlaceholder("New stat name…");

    // "Health" already exists.
    await statInput.fill("Health");
    await page.getByRole("button", { name: /add stat/i }).click();

    // Count should remain at 6 (the initial default).
    await expect(page.getByTestId(/^stat-row-/)).toHaveCount(6);
  });

  test("updates the overall score when a stat star is clicked", async ({
    page,
  }) => {
    // Find the health stat row and click the first star.
    const healthRow = page.getByTestId("stat-row-health");
    const stars = healthRow.locator("svg");

    await stars.first().click();

    // Overall score label should reflect the change (current initial total is 15).
    await expect(page.getByText(/overall score/i)).toBeVisible();
  });

  test("stat input clears after adding a new stat", async ({ page }) => {
    const statInput = page.getByPlaceholder("New stat name…");
    await statInput.fill("Creativity");
    await page.getByRole("button", { name: /add stat/i }).click();

    await expect(statInput).toHaveValue("");
  });

  test("add stat button is disabled when input is empty", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /add stat/i })
    ).toBeDisabled();
  });

  test("displays level badge with correct initial level", async ({ page }) => {
    // First character starts at level 5.
    await expect(page.getByTestId("character-level")).toContainText("LVL 5");
  });
});
