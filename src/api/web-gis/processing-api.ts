import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";

import type {
  CreateProcessingJobPayload,
  ProcessingJobResponse,
  ProcessingToolDefinition,
} from "./types";

interface ProcessingToolsResponse {
  tools: ProcessingToolDefinition[];
}

export const useProcessingTools = () => {
  return useQuery({
    queryKey: QueryKeys.processingTools,
    queryFn: async () => {
      return await api.get<ApiResponse<ProcessingToolsResponse>>(
        `${QueryKeys.processingTools[0]}/`
      );
    },
    select: (response: AxiosResponse<ApiResponse<ProcessingToolsResponse>>) =>
      response.data,
    staleTime: Infinity,
  });
};

export const useProcessingJobs = () => {
  return useQuery({
    queryKey: QueryKeys.processingJobs,
    queryFn: async () => {
      return await api.get<ApiResponse<ProcessingJobResponse[]>>(
        `${QueryKeys.processingJobs[0]}/`
      );
    },
    select: (response: AxiosResponse<ApiResponse<ProcessingJobResponse[]>>) =>
      response.data,
  });
};

export const useSubmitProcessingJob = () => {
  return useMutation({
    mutationFn: async (payload: CreateProcessingJobPayload) => {
      return await api.post<ApiResponse<ProcessingJobResponse>>(
        `${QueryKeys.processingJobs[0]}/`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.processingJobs,
      });
    },
  });
};

export const useCancelProcessingJob = () => {
  return useMutation({
    mutationFn: async (jobId: string) => {
      return await api.delete(`${QueryKeys.processingJobs[0]}/${jobId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.processingJobs,
      });
    },
  });
};
