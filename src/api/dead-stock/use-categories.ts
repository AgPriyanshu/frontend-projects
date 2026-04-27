import { useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { DsCategory } from "./types";

export const useCategories = () => {
  return useQuery({
    queryKey: QueryKeys.deadStock.categories,
    queryFn: async () =>
      api.get<ApiResponse<DsCategory[]>>("/dead-stock/categories/"),
    select: (r) => r.data.data,
    staleTime: 1000 * 60 * 60,
  });
};
