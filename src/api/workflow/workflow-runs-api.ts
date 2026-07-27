import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";

import type { WorkflowRunResponse } from "./types";

const isRunActive = (run: WorkflowRunResponse) =>
  run.status === "pending" || run.status === "running";

export const useWorkflowRuns = (workflowId: string | null) => {
  return useQuery({
    queryKey: QueryKeys.workflowRuns(workflowId ?? "none"),
    queryFn: async () => {
      return await api.get<ApiResponse<WorkflowRunResponse[]>>(
        `${QueryKeys.workflowRuns(workflowId as string)[0]}/`
      );
    },
    select: (response: AxiosResponse<ApiResponse<WorkflowRunResponse[]>>) =>
      response.data,
    enabled: !!workflowId,
    refetchInterval: (query) => {
      const response = query.state.data as
        | AxiosResponse<ApiResponse<WorkflowRunResponse[]>>
        | undefined;
      const runs = response?.data?.data;

      if (Array.isArray(runs) && runs.some(isRunActive)) {
        return 3000;
      }

      return false;
    },
  });
};

export const useWorkflowRun = (
  workflowId: string | null,
  runId: string | null
) => {
  return useQuery({
    queryKey: QueryKeys.workflowRun(workflowId ?? "none", runId ?? "none"),
    queryFn: async () => {
      return await api.get<ApiResponse<WorkflowRunResponse>>(
        `${QueryKeys.workflowRun(workflowId as string, runId as string)[0]}/`
      );
    },
    select: (response: AxiosResponse<ApiResponse<WorkflowRunResponse>>) =>
      response.data,
    enabled: !!workflowId && !!runId,
    refetchInterval: (query) => {
      const response = query.state.data as
        | AxiosResponse<ApiResponse<WorkflowRunResponse>>
        | undefined;
      const run = response?.data?.data;

      return run && isRunActive(run) ? 3000 : false;
    },
  });
};

export const useSubmitWorkflowRun = () => {
  return useMutation({
    mutationFn: async (workflowId: string) => {
      return await api.post<ApiResponse<WorkflowRunResponse>>(
        `${QueryKeys.workflowRuns(workflowId)[0]}/`
      );
    },
    onSuccess: (_response, workflowId) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workflowRuns(workflowId),
      });
    },
  });
};

export const useCancelWorkflowRun = () => {
  return useMutation({
    mutationFn: async ({
      workflowId,
      runId,
    }: {
      workflowId: string;
      runId: string;
    }) => {
      return await api.delete(
        `${QueryKeys.workflowRun(workflowId, runId)[0]}/`
      );
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workflowRuns(variables.workflowId),
      });
    },
  });
};
