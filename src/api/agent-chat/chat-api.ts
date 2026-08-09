import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import type { MessageRole } from "features/agent-chat/store";
import api from "../api";
import type {
  ChatMessageResponse,
  ChatSessionListResponse,
  ChatSessionResponse,
  CreateChatSessionPayload,
  LLMListResponse,
} from "./types";

export const useChatMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: QueryKeys.chatMessages(sessionId ?? ""),
    queryFn: async () => {
      return await api.get<ApiResponse<Record<string, unknown>[]>>(
        `/ai/messages/?session_id=${sessionId}`
      );
    },
    select: (
      response: AxiosResponse<ApiResponse<Record<string, unknown>[]>>
    ): ChatMessageResponse[] =>
      (response.data.data ?? []).map((m) => ({
        id: m.id as string,
        sessionId: (m.sessionId ?? m.session) as string,
        message: (m.content ?? m.message ?? "") as string,
        userId: (m.userId ?? m.user) as number,
        role: m.role as MessageRole,
      })),
    enabled: !!sessionId,
  });
};

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

export const useLLMs = () => {
  return useQuery({
    queryKey: QueryKeys.llms,
    queryFn: async () => {
      return await api.get<ApiResponse<LLMListResponse>>("/ai/llms/");
    },
    select: (response: AxiosResponse<ApiResponse<LLMListResponse>>) =>
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
    onSuccess: (_, deletedId: string) => {
      queryClient.setQueryData(
        QueryKeys.chatSessions,
        (
          old: AxiosResponse<ApiResponse<ChatSessionListResponse>> | undefined
        ) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            data: {
              ...old.data,
              data: (old.data.data ?? []).filter((s) => s.id !== deletedId),
            },
          };
        }
      );
    },
  });
};
