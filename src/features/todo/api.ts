import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/tasks",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const todoApi = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to fetch tasks",
          error.response?.status
        );
      }
      throw error;
    }
  },

  createTask: async (description: string): Promise<Task> => {
    try {
      const response = await api.post("/", { description, completed: false });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to create task",
          error.response?.status
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
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to update task",
          error.response?.status
        );
      }
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    try {
      await api.delete(`/${id}/`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ApiError(
          error.response?.data?.detail || "Failed to delete task",
          error.response?.status
        );
      }
      throw error;
    }
  },
};
