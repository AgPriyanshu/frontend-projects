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

export const useItem = (
  id: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: false | number | (() => false | number);
  }
) => {
  return useQuery({
    queryKey: QueryKeys.deadStock.item(id),
    queryFn: async () =>
      api.get<ApiResponse<DsItem>>(`/dead-stock/items/${id}/`),
    select: (r) => r.data.data,
    enabled: !!id,
    ...options,
  });
};

export const useCreateItem = () => {
  return useMutation({
    mutationFn: async (payload: DsCreateItemPayload) => {
      const response = await api.post<ApiResponse<DsItem>>(
        "/dead-stock/items/",
        payload
      );
      return response.data.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.deadStock.myItems,
      });
      const previousItems = queryClient.getQueryData<DsItem[]>([
        ...QueryKeys.deadStock.myItems,
        undefined,
      ]);
      if (previousItems) {
        queryClient.setQueryData<DsItem[]>(
          [...QueryKeys.deadStock.myItems, undefined],
          [
            {
              id: `temp-${Date.now()}`,
              ...payload,
              status: "active",
              images: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              staleAt: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              shop: "temp",
              shopName: "temp",
              sku: payload.sku || "",
              description: payload.description || "",
              price: payload.price || null,
            } as unknown as DsItem,
            ...previousItems,
          ]
        );
      }
      return { previousItems };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          [...QueryKeys.deadStock.myItems, undefined],
          context.previousItems
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};

export const useUpdateItem = () => {
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<DsCreateItemPayload> & { id: string }) => {
      const response = await api.patch<ApiResponse<DsItem>>(
        `/dead-stock/items/${id}/`,
        payload
      );
      return response.data.data;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.deadStock.myItems,
      });
      const previousItems = queryClient.getQueryData<DsItem[]>([
        ...QueryKeys.deadStock.myItems,
        undefined,
      ]);

      if (previousItems) {
        queryClient.setQueryData<DsItem[]>(
          [...QueryKeys.deadStock.myItems, undefined],
          previousItems.map((item) =>
            item.id === variables.id
              ? ({ ...item, ...variables } as DsItem)
              : item
          )
        );
      }
      return { previousItems };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          [...QueryKeys.deadStock.myItems, undefined],
          context.previousItems
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.deadStock.item(variables.id),
      });
    },
  });
};

export const useDeleteItem = () => {
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/dead-stock/items/${id}/`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.deadStock.myItems,
      });
      const previousItems = queryClient.getQueryData<DsItem[]>([
        ...QueryKeys.deadStock.myItems,
        undefined,
      ]);

      if (previousItems) {
        queryClient.setQueryData<DsItem[]>(
          [...QueryKeys.deadStock.myItems, undefined],
          previousItems.filter((item) => item.id !== id)
        );
      }
      return { previousItems };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          [...QueryKeys.deadStock.myItems, undefined],
          context.previousItems
        );
      }
    },
    onSettled: () => {
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.deadStock.myItems,
      });
      const previousItems = queryClient.getQueryData<DsItem[]>([
        ...QueryKeys.deadStock.myItems,
        undefined,
      ]);
      if (previousItems) {
        queryClient.setQueryData<DsItem[]>(
          [...QueryKeys.deadStock.myItems, undefined],
          previousItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  staleAt: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                }
              : item
          )
        );
      }
      return { previousItems };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          [...QueryKeys.deadStock.myItems, undefined],
          context.previousItems
        );
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.item(id) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};
