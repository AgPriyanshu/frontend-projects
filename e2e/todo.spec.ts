import { test, expect } from "./fixtures/auth";

const TASK_API = "**/tasks/**";

/** A minimal mock task list with two items. */
const mockTasks = [
  {
    id: "task-1",
    description: "Write unit tests",
    isCompleted: false,
    completedAt: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "task-2",
    description: "Review pull request",
    isCompleted: true,
    completedAt: "2024-01-01T12:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T12:00:00Z",
  },
];

const taskListResponse = (tasks = mockTasks) => ({
  meta: { status_code: 200, success: true, message: "OK" },
  data: tasks,
});

test.describe("Todo — task list", () => {
  test.beforeEach(async ({ page }) => {
    // Stub all task API calls with the mock data.
    await page.route(TASK_API, async (route) => {
      const method = route.request().method();

      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(taskListResponse()),
        });
      } else {
        // Mutations (POST, PATCH, DELETE) respond with a generic success.
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            meta: { status_code: 200, success: true, message: "OK" },
            data: {},
          }),
        });
      }
    });

    await page.goto("/todo");
  });

  test("renders the page heading and stat counter", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /today's tasks/i })
    ).toBeVisible();
    await expect(page.getByText(/2 tasks • 1 completed/i)).toBeVisible();
  });

  test("renders all fetched tasks", async ({ page }) => {
    const items = page.getByTestId("todo-item");
    await expect(items).toHaveCount(2);
    await expect(page.getByText("Write unit tests")).toBeVisible();
    await expect(page.getByText("Review pull request")).toBeVisible();
  });

  test("shows the task input field", async ({ page }) => {
    await expect(page.getByPlaceholder("Add a new task...")).toBeVisible();
  });

  test("calls the add-task API when pressing Enter in the input", async ({
    page,
  }) => {
    let addCalled = false;

    await page.route(TASK_API, async (route) => {
      if (route.request().method() === "POST") {
        addCalled = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(taskListResponse()),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(taskListResponse()),
        });
      }
    });

    await page.getByPlaceholder("Add a new task...").fill("New task from test");
    await page.getByPlaceholder("Add a new task...").press("Enter");

    expect(addCalled).toBe(true);
  });

  test("does not add a task when the input is empty", async ({ page }) => {
    let addCalled = false;

    await page.route(TASK_API, async (route) => {
      if (route.request().method() === "POST") {
        addCalled = true;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(taskListResponse()),
      });
    });

    await page.getByPlaceholder("Add a new task...").press("Enter");
    expect(addCalled).toBe(false);
  });

  test("shows loading skeleton before tasks load", async ({ page }) => {
    // Delay the API response to observe the skeleton.
    await page.route(TASK_API, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(taskListResponse()),
      });
    });

    await page.goto("/todo");

    // Skeleton should appear initially.
    await expect(page.getByTestId("todo-skeleton")).toBeVisible();

    // After data loads, actual items render.
    await expect(page.getByTestId("todo-item").first()).toBeVisible();
  });
});
