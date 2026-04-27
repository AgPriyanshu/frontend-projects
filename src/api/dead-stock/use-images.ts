import { useMutation } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  DsConfirmImagePayload,
  DsItemImage,
  DsPresignResponse,
} from "./types";

export const usePresignImage = (itemId: string) => {
  return useMutation({
    mutationFn: async (contentType: string) => {
      const response = await api.post<ApiResponse<DsPresignResponse>>(
        `/dead-stock/items/${itemId}/images/presign/`,
        { contentType }
      );
      return response.data.data;
    },
  });
};

export const useConfirmImage = (itemId: string) => {
  return useMutation({
    mutationFn: async (payload: DsConfirmImagePayload) => {
      const response = await api.post<ApiResponse<DsItemImage>>(
        `/dead-stock/items/${itemId}/images/confirm/`,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.deadStock.item(itemId),
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};

export const useDeleteImage = (itemId: string) => {
  return useMutation({
    mutationFn: async (imageId: string) =>
      api.delete(`/dead-stock/items/${itemId}/images/${imageId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.deadStock.item(itemId),
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};

export const useUpdateImage = (itemId: string) => {
  return useMutation({
    mutationFn: async ({
      imageId,
      ...payload
    }: {
      imageId: string;
      isPrimary?: boolean;
      position?: number;
    }) => {
      const response = await api.patch<ApiResponse<DsItemImage>>(
        `/dead-stock/items/${itemId}/images/${imageId}/`,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.deadStock.item(itemId),
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};

export const useReorderImages = (itemId: string) => {
  return useMutation({
    mutationFn: async (imageIds: string[]) => {
      const response = await api.patch<ApiResponse<DsItemImage[]>>(
        `/dead-stock/items/${itemId}/images/reorder/`,
        { imageIds }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.deadStock.item(itemId),
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myItems });
    },
  });
};
