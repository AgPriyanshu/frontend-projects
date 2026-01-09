export interface TaskResponse {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskListResponse = TaskResponse[];

export interface UpdateTodoPayload {
  description?: string;
  isCompleted?: boolean;
}

export interface AddTodoPayload {
  description: string;
}
