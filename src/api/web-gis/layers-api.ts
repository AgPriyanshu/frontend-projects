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
