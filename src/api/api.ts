import axios, { AxiosError, HttpStatusCode, type AxiosResponse } from "axios";
import { isNull } from "lodash";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (!isNull(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors.
api.interceptors.response.use(
  (response: AxiosResponse<any, any>) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === HttpStatusCode.Unauthorized) {
      // Clear token and redirect to login.
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
