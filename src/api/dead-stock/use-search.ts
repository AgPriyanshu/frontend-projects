import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { DsSearchPage, DsSearchParams } from "./types";

export const useSearchAutocomplete = (q: string) =>
  useQuery({
    queryKey: QueryKeys.deadStock.autocomplete(q),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ suggestions: string[] }>>(
        "/dead-stock/search/autocomplete/",
        { params: { q } }
      );
      return response.data.data.suggestions;
    },
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
  });

export const useSearchItems = (params: DsSearchParams) => {
  return useInfiniteQuery({
    queryKey: QueryKeys.deadStock.search(params),
    queryFn: async ({ pageParam }) => {
      const response = await api.get<ApiResponse<DsSearchPage>>(
        "/dead-stock/search/items/",
        {
          params: {
            ...params,
            cursor: pageParam ?? undefined,
          },
        }
      );
      return response.data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};
