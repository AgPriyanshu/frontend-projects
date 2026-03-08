import { useMutation } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";

type ShortenURLPayload = {
  url: string;
};

type ShortenURLResponse = {
  url: string;
  shortUrl: string;
};

export const useShortenURL = () => {
  return useMutation({
    mutationFn: async (payload: ShortenURLPayload) => {
      return await api.post<ApiResponse<ShortenURLResponse>>(
        QueryKeys.urls[0],
        payload
      );
    },
  });
};
