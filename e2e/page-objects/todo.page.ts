import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the Todo page (/todo).
 */
export class TodoPage {
  readonly page: Page;
  readonly taskInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.taskInput = page.getByPlaceholder(/add a new task/i);
  }

  async goto() {
    await this.page.goto("/todo");
  }

  /** Returns the heading that shows task stats (e.g. "3 TASKS • 1 COMPLETED"). */
  statsText(): Locator {
    return this.page.getByText(/tasks •.*completed/i);
  }

  /** Returns all rendered todo items. */
  todoItems(): Locator {
    return this.page.getByTestId("todo-item");
  }

  async addTask(title: string) {
    await this.taskInput.fill(title);
    await this.taskInput.press("Enter");
  }

  /** Clicks the checkbox of the todo item at the given 0-based index. */
  async toggleTask(index: number) {
    await this.todoItems().nth(index).getByRole("checkbox").click();
  }

  /** Clicks the delete button of the todo item at the given 0-based index. */
  async deleteTask(index: number) {
    await this.todoItems()
      .nth(index)
      .getByRole("button", { name: /delete/i })
      .click();
  }
}
