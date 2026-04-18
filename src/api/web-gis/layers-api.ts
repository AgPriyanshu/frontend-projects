import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import type { CreateLayerPayload, LayerResponse } from "./types";

export const useLayers = () => {
  return useQuery({
    queryKey: QueryKeys.layers,
    queryFn: async () => {
      return await api.get<ApiResponse<LayerResponse[]>>(QueryKeys.layers[0]);
    },
    select: (response: AxiosResponse<ApiResponse<LayerResponse[]>>) =>
      response.data,
  });
};

export const useAddLayer = () => {
  return useMutation({
    mutationFn: async (payload: CreateLayerPayload) => {
      return await api.post<ApiResponse<LayerResponse>>(
        QueryKeys.layers[0],
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.layers,
      });
    },
    onError: (error) => {
      console.error("Error creating layer:", error);
      alert("Failed to create layer. Please try again.");
    },
  });
};

export const useDeleteLayer = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(QueryKeys.layer(id)[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.layers,
      });
    },
  });
};

/**
 * Builds the MVT tile URL template for a vector dataset.
 * Used by MapLibre to request individual tiles from the backend.
 */
export const buildVectorTileUrl = (datasetId: string): string => {
  const baseUrl = api.defaults.baseURL ?? "";
  return `${baseUrl}${QueryKeys.datasetVectorTiles(datasetId)[0]}`;
};

/**
 * Builds the XYZ tile URL template for a raster dataset.
 * Used by MapLibre to request individual tiles from the backend.
 */
export const buildTileUrl = (
  datasetId: string,
  options?: { terrain?: boolean }
): string => {
  const baseUrl = api.defaults.baseURL ?? "";
  const tilesPath = QueryKeys.datasetTiles(datasetId)[0];
  const params = new URLSearchParams();

  if (options?.terrain) {
    params.set("terrain", "true");
  }

  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  return `${baseUrl}${tilesPath}${suffix}`;
};
