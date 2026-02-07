import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import type { CreateLayerPayload, LayerResponse } from "./types";

/**
 * Fetches all layers.
 */
export const useLayers = () => {
  return useQuery({
    queryKey: QueryKeys.layers,
    queryFn: async () => {
      return await api.get<ApiResponse<LayerResponse[]>>(
        `/web-gis${QueryKeys.layers[0]}`
      );
    },
    select: (response: AxiosResponse<ApiResponse<LayerResponse[]>>) =>
      response.data,
  });
};

/**
 * Creates a new layer from a dataset.
 */
export const useCreateLayer = () => {
  return useMutation({
    mutationFn: async (payload: CreateLayerPayload) => {
      return await api.post<ApiResponse<LayerResponse>>(
        `/web-gis${QueryKeys.layers[0]}`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.layers,
      });
    },
  });
};

/**
 * Deletes a layer by ID.
 */
export const useDeleteLayer = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/web-gis/layers/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.layers,
      });
    },
  });
};
