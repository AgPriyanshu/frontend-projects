import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";

import type {
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  WorkflowResponse,
} from "./types";

export const useWorkflows = () => {
  return useQuery({
    queryKey: QueryKeys.workflows,
    queryFn: async () => {
      return await api.get<ApiResponse<WorkflowResponse[]>>(
        `${QueryKeys.workflows[0]}/`
      );
    },
    select: (response: AxiosResponse<ApiResponse<WorkflowResponse[]>>) =>
      response.data,
  });
};

export const useWorkflow = (id: string | null) => {
  return useQuery({
    queryKey: QueryKeys.workflow(id ?? "none"),
    queryFn: async () => {
      return await api.get<ApiResponse<WorkflowResponse>>(
        `${QueryKeys.workflows[0]}/${id}/`
      );
    },
    select: (response: AxiosResponse<ApiResponse<WorkflowResponse>>) =>
      response.data,
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  return useMutation({
    mutationFn: async (payload: CreateWorkflowPayload) => {
      return await api.post<ApiResponse<WorkflowResponse>>(
        `${QueryKeys.workflows[0]}/`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.workflows });
    },
  });
};

export const useUpdateWorkflow = () => {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWorkflowPayload;
    }) => {
      return await api.patch<ApiResponse<WorkflowResponse>>(
        `${QueryKeys.workflows[0]}/${id}/`,
        payload
      );
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.workflows });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workflow(variables.id),
      });
    },
  });
};

export const useDeleteWorkflow = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`${QueryKeys.workflows[0]}/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.workflows });
    },
  });
};
