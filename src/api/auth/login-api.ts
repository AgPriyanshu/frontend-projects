import { api } from "../api";
import { apiPayloadMapper, apiResponseMapper } from "../helpers";
import type { ApiResponse } from "../types";
import type { LoginPayload, LoginResponseData } from "./types";
import { useMutation } from "@tanstack/react-query";
export const loginApi = {
  login: async (
    payload: LoginPayload
  ): Promise<ApiResponse<LoginResponseData>> =>
    apiResponseMapper<LoginResponseData>(
      await api.post<LoginResponseData, ApiResponse<LoginResponseData>>(
        "/auth/login/",
        apiPayloadMapper(payload)
      )
    ),
};

// Hooks.
export const useLoginRequest = () =>
  useMutation({
    mutationFn: loginApi.login,
  });
