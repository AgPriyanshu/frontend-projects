import { useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import type { DatasetNodeResponse } from "./types";

export const useDatasetNodes = () => {
  return useQuery({
    queryKey: QueryKeys.datasetNodes,
    queryFn: async () => {
      return await api.get<ApiResponse<DatasetNodeResponse[]>>(
        `/web-gis${QueryKeys.datasetNodes[0]}`
      );
    },
    select: (response: AxiosResponse<ApiResponse<DatasetNodeResponse[]>>) =>
      response.data,
  });
};
