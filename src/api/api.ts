import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAccessToken } from "shared/local-storage/token";
import { EnvVariable } from "app/config/env-variables";

const api: AxiosInstance = axios.create({
  baseURL: EnvVariable.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    // Skip adding token for login endpoint
    const isLoginEndpoint = config.url?.includes("/auth/login");

    if (token && config.headers && !isLoginEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;
