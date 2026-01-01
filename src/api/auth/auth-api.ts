import { useMutation } from "@tanstack/react-query";
import api from "../api";
import { setTokens } from "../token";
import { queryClient } from "../query-client";
import type { LoginCredentials, LoginResponse } from "./types";
import { toCamelCase, type SnakeToCamelCase } from "shared/utils";

type LoginResponseCamelCase = SnakeToCamelCase<LoginResponse>;

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      // Convert snake_case response from server to camelCase
      return toCamelCase<LoginResponseCamelCase>(response.data);
    },
    onSuccess: (data) => {
      // Core logic that should always happen on successful login
      setTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
};
