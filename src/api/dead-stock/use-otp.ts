import { useMutation } from "@tanstack/react-query";
import api from "api/api";
import type { ApiResponse } from "api/types";
import { setAccessToken } from "shared/local-storage/token";
import type { DsOtpVerifyResponse } from "./types";

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      return api.post<ApiResponse<{ sent: boolean }>>(
        "/dead-stock/auth/otp/request/",
        { phone }
      );
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (payload: { phone: string; otp: string }) => {
      return api.post<ApiResponse<DsOtpVerifyResponse>>(
        "/dead-stock/auth/otp/verify/",
        payload
      );
    },
    onSuccess: (response) => {
      setAccessToken(response.data.data.token);
    },
  });
};
