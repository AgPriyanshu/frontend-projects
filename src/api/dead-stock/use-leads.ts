import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  DsCreateLeadPayload,
  DsCreateReportPayload,
  DsLead,
} from "./types";

export const useCreateLead = () => {
  return useMutation({
    mutationFn: async (payload: DsCreateLeadPayload) => {
      const response = await api.post<ApiResponse<DsLead>>(
        "/dead-stock/leads/",
        payload
      );
      return response.data.data;
    },
  });
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (payload: DsCreateReportPayload) =>
      api.post("/dead-stock/reports/", payload),
  });
};

export const useLeadInbox = () => {
  return useQuery({
    queryKey: QueryKeys.deadStock.leadInbox,
    queryFn: async () =>
      api.get<ApiResponse<DsLead[]>>("/dead-stock/leads/inbox/"),
    select: (r) => r.data.data,
  });
};

export const invalidateLeadInbox = () => {
  queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.leadInbox });
};
