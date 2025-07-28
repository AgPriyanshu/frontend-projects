import { AxiosError } from "axios";
import { api, type Task } from "../api";
import { isUndefined } from "lodash";

export const todoApi = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get("/tasks/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && !isUndefined(error.response)) {
        throw new AxiosError(
          error.response.data.detail || "Failed to fetch tasks",
          error.response.status.toString()
        );
      }
      throw error;
    }
  },

  createTask: async (description: string): Promise<Task> => {
    try {
      const response = await api.post("/tasks/", {
        description,
        completed: false,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && !isUndefined(error.response)) {
        throw new AxiosError(
          error.response?.data?.detail || "Failed to create task",
          error.response.status.toString()
        );
      }
      throw error;
    }
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    try {
      const response = await api.patch(`/${id}/`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && !isUndefined(error.response)) {
        throw new AxiosError(
          error.response?.data?.detail || "Failed to update task",
          error.response?.status.toString()
        );
      }
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    try {
      await api.delete(`/${id}/`);
    } catch (error) {
      if (error instanceof AxiosError && !isUndefined(error.response)) {
        throw new AxiosError(
          error.response?.data?.detail || "Failed to delete task",
          error.response?.status.toString()
        );
      }
      throw error;
    }
  },
};
