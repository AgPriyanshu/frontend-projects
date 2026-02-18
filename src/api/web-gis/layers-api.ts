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
      return await api.get<ApiResponse<LayerResponse[]>>(
        `${QueryKeys.layers[0]}`
      );
    },
    select: (response: AxiosResponse<ApiResponse<LayerResponse[]>>) =>
      response.data,
  });
};

export const useAddLayer = () => {
  return useMutation({
    mutationFn: async (payload: CreateLayerPayload) => {
      return await api.post<ApiResponse<LayerResponse>>(
        `${QueryKeys.layers[0]}`,
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
 * Loosely-typed GeoJSON response from the API.
 */
interface GeoJSONResponse {
  type?: string;
  features?: Record<string, unknown>[];
  [key: string]: unknown;
}

/**
 * Fetches GeoJSON data for a layer.
 * Tries PostGIS features first, falls back to dataset file download.
 */
export const fetchLayerGeoJSON = async (
  layerId: string,
  datasetId: string
): Promise<GeoJSONResponse | null> => {
  return queryClient.fetchQuery({
    queryKey: QueryKeys.layerGeoJson(layerId),
    queryFn: async () => {
      // Try fetching GeoJSON from PostGIS features.
      const response = await api.get(`/web-gis/layers/${layerId}/geojson/`);
      let geojson = response.data;

      // Fallback: if no features in PostGIS, try the original file.
      if (!geojson?.features || geojson.features.length === 0) {
        const fallbackResponse = await api.get(
          `/web-gis/datasets/${datasetId}/download`
        );
        geojson = fallbackResponse.data;
      }

      return geojson;
    },
  });
};

/**
 * Builds the XYZ tile URL template for a raster dataset.
 * Used by MapLibre to request individual tiles from the backend.
 */
export const buildTileUrl = (datasetId: string): string => {
  const baseUrl = api.defaults.baseURL ?? "";
  return `${baseUrl}/web-gis/datasets/${datasetId}/tiles/{z}/{x}/{y}.png`;
};
