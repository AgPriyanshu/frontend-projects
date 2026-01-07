import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import api from "../api";
import type { TaskListResponse } from "./types";
import type { AxiosResponse } from "axios";

export const useTodoList = () => {
  return useQuery({
    queryKey: ["/tasks"],
    queryFn: async () => {
      return await api.get<ApiResponse<TaskListResponse>>("/tasks/");
    },
    select: (response: AxiosResponse<ApiResponse<TaskListResponse>>) =>
      response.data,
  });
};
