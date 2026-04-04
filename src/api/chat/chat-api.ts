import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import api from "../api";
import type {
  ChatSessionListResponse,
  ChatSessionResponse,
  CreateChatSessionPayload,
} from "./types";
import { QueryKeys } from "api/query-keys";

export const useChatSessions = () => {
  return useQuery({
    queryKey: QueryKeys.chatSessions,
    queryFn: async () => {
      return await api.get<ApiResponse<ChatSessionListResponse>>(
        "/ai/chat-sessions/"
      );
    },
    select: (response: AxiosResponse<ApiResponse<ChatSessionListResponse>>) =>
      response.data,
  });
};

export const useCreateChatSession = () => {
  return useMutation({
    mutationFn: async (payload: CreateChatSessionPayload) => {
      return await api.post<ApiResponse<ChatSessionResponse>>(
        "/ai/chat-sessions/",
        payload
      );
    },
  });
};

export const useDeleteChatSession = (sessionId: string) => {
  return useMutation({
    mutationFn: async () => {
      return await api.delete<ApiResponse>(`/ai/chat-sessions/${sessionId}/`);
    },
  });
};
