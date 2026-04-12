import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";

export const fetchFeaturesAsGeoJSON = async (
  datasetId: string
): Promise<GeoJSON.FeatureCollection> => {
  const response = await api.get<ApiResponse<GeoJSON.FeatureCollection>>(
    QueryKeys.features(datasetId)[0]
  );
  return response.data.data;
};

export const useFeatures = (datasetId: string) => {
  return useQuery({
    queryKey: QueryKeys.features(datasetId),
    queryFn: async () => {
      return await api.get<ApiResponse<GeoJSON.FeatureCollection>>(
        QueryKeys.features(datasetId)[0]
      );
    },
    select: (response: AxiosResponse<ApiResponse<GeoJSON.FeatureCollection>>) =>
      response.data,
  });
};

export const useSaveFeatures = () => {
  return useMutation({
    mutationFn: async (payload: {
      dataset: string;
      features: GeoJSON.Feature[];
    }) => {
      const formattedPayload = payload.features.map((feature) => ({
        type: "Feature",
        geometry: feature.geometry,
        properties: {
          ...(feature.properties || {}),
          dataset: payload.dataset,
        },
      }));

      return await api.post("/web-gis/features/", formattedPayload);
    },
    onError: (error) => {
      console.error("Error saving features:", error);
    },
  });
};
