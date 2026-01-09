import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import api from "../api";
import type {
  AddTodoPayload,
  TaskListResponse,
  UpdateTodoPayload,
} from "./types";
import { QueryKeys } from "api/query-keys";

export const useTodoList = () => {
  return useQuery({
    queryKey: QueryKeys.todoList,
    queryFn: async () => {
      return await api.get<ApiResponse<TaskListResponse>>("/tasks/");
    },
    select: (response: AxiosResponse<ApiResponse<TaskListResponse>>) =>
      response.data,
  });
};

export const useAddTodo = () => {
  return useMutation({
    mutationFn: async (payload: AddTodoPayload) => {
      return await api.post<ApiResponse<TaskListResponse>>("/tasks/", payload);
    },
  });
};

export const useUpdateTodo = (taskId: string) => {
  return useMutation({
    mutationFn: async (payload: UpdateTodoPayload) => {
      return await api.patch<ApiResponse<TaskListResponse>>(
        `/tasks/${taskId}/`,
        payload
      );
    },
  });
};

export const useDeleteTodo = (taskId: string) => {
  return useMutation({
    mutationFn: async () => {
      return await api.delete<ApiResponse>(`/tasks/${taskId}/`);
    },
  });
};
