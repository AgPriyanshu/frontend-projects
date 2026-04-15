import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the Level Up page (/level-up).
 */
export class LevelUpPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/level-up");
  }

  /** Returns all character sidebar items. */
  characterCards(): Locator {
    return this.page.getByTestId("character-card");
  }

  /** Returns the "Add character" button in the sidebar. */
  addCharacterButton(): Locator {
    return this.page.getByRole("button", { name: /add character/i });
  }

  /** Returns the character name editable field in the panel. */
  characterNameField(): Locator {
    return this.page.getByTestId("character-name");
  }

  /** Returns the character class editable field in the panel. */
  characterClassField(): Locator {
    return this.page.getByTestId("character-class");
  }

  /** Returns the level display/control. */
  levelDisplay(): Locator {
    return this.page.getByTestId("character-level");
  }

  /** Returns all star icons for a given stat row by stat name. */
  statStars(statName: string): Locator {
    return this.page
      .getByTestId(`stat-row-${statName.toLowerCase()}`)
      .getByRole("img");
  }
}
