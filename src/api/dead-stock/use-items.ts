import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { DsCreateItemPayload, DsItem } from "./types";

export const useMyItems = (status?: string) => {
  return useQuery({
    queryKey: [...QueryKeys.deadStock.myItems, status],
    queryFn: async () =>
      api.get<ApiResponse<DsItem[]>>("/dead-stock/items/", {
        params: status ? { status } : undefined,
      }),
    select: (r) => r.data.data,
  });
};

export const useItem = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.deadStock.item(id),
    queryFn: async () =>
      api.get<ApiResponse<DsItem>>(`/dead-stock/items/${id}/`),
    select: (r) => r.data.data,
    enabled: !!id,
  });
};

export const useCreateItem = () => {
  return useMutation({
    mutationFn: async (payload: DsCreateItemPayload) =>
      api.post<ApiResponse<DsItem>>("/dead-stock/items/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};

export const useUpdateItem = () => {
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<DsCreateItemPayload> & { id: string }) =>
      api.patch<ApiResponse<DsItem>>(`/dead-stock/items/${id}/`, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.item(id) });
    },
  });
};

export const useDeleteItem = () => {
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/dead-stock/items/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};

export const useRefreshItem = () => {
  return useMutation({
    mutationFn: async (id: string) =>
      api.post<ApiResponse<{ staleAt: string }>>(
        `/dead-stock/items/${id}/refresh/`
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.item(id) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};
