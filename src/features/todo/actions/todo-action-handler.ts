import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import { Action, ActionHandler } from "../../chat/agent/action";
import type { ActionResult, RawUIAction } from "../../chat/agent/types";

// ---------------------------------------------------------------------------
// Action classes
// ---------------------------------------------------------------------------

export class CreateTaskAction extends Action {
  readonly app = "todo";
  readonly actionType = "create_task";
  readonly payload: { description: string };

  constructor(description: string) {
    super();
    this.payload = { description };
  }

  validate(): boolean {
    return Boolean(this.payload.description?.trim());
  }
}

export class CompleteTaskAction extends Action {
  readonly app = "todo";
  readonly actionType = "complete_task";
  readonly payload: { description: string | null; task_id: string | null };

  constructor(description: string | null, taskId: string | null) {
    super();
    this.payload = { description, task_id: taskId };
  }

  validate(): boolean {
    return Boolean(this.payload.description || this.payload.task_id);
  }
}

export class DeleteTaskAction extends Action {
  readonly app = "todo";
  readonly actionType = "delete_task";
  readonly payload: { description: string | null; task_id: string | null };

  constructor(description: string | null, taskId: string | null) {
    super();
    this.payload = { description, task_id: taskId };
  }

  validate(): boolean {
    return Boolean(this.payload.description || this.payload.task_id);
  }
}

export class ListTasksAction extends Action {
  readonly app = "todo";
  readonly actionType = "list_tasks";
  readonly payload = {};
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export class TodoActionHandler extends ActionHandler {
  readonly app = "todo";

  supportedActions(): string[] {
    return ["create_task", "complete_task", "delete_task", "list_tasks"];
  }

  parse(raw: RawUIAction): Action | null {
    switch (raw.action_type) {
      case "create_task":
        return new CreateTaskAction((raw.payload.description as string) ?? "");
      case "complete_task":
        return new CompleteTaskAction(
          (raw.payload.description as string) ?? null,
          (raw.payload.task_id as string) ?? null
        );
      case "delete_task":
        return new DeleteTaskAction(
          (raw.payload.description as string) ?? null,
          (raw.payload.task_id as string) ?? null
        );
      case "list_tasks":
        return new ListTasksAction();
      default:
        return null;
    }
  }

  async execute(action: Action): Promise<ActionResult> {
    try {
      switch (action.actionType) {
        case "create_task":
          return await this.handleCreateTask(action as CreateTaskAction);
        case "list_tasks":
          return await this.handleListTasks();
        default:
          return {
            app: this.app,
            actionType: action.actionType,
            success: true,
          };
      }
    } catch (error) {
      return {
        app: this.app,
        actionType: action.actionType,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleCreateTask(
    action: CreateTaskAction
  ): Promise<ActionResult> {
    await api.post("/tasks/", {
      description: action.payload.description,
    });

    // Invalidate todo list cache.
    queryClient.invalidateQueries({ queryKey: QueryKeys.todoList });

    return {
      app: this.app,
      actionType: action.actionType,
      success: true,
      data: { description: action.payload.description },
    };
  }

  private async handleListTasks(): Promise<ActionResult> {
    const response = await api.get<ApiResponse<unknown[]>>("/tasks/");

    return {
      app: this.app,
      actionType: "list_tasks",
      success: true,
      data: response.data?.data ?? [],
    };
  }
}
