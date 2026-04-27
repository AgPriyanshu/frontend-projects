import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { DsCreateShopPayload, DsShop, DsShopWithDistance } from "./types";

export const useMyShop = () => {
  return useQuery({
    queryKey: QueryKeys.deadStock.myShop,
    queryFn: async () => api.get<ApiResponse<DsShop>>("/dead-stock/shops/me/"),
    select: (r) => r.data.data,
    retry: false,
  });
};

export const usePublicShop = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.deadStock.shop(id),
    queryFn: async () =>
      api.get<ApiResponse<DsShop>>(`/dead-stock/shops/${id}/`),
    select: (r) => r.data.data,
    enabled: !!id,
  });
};

export const useNearbyShops = (
  lat: number | null,
  lng: number | null,
  radiusKm = 5
) => {
  return useQuery({
    queryKey: QueryKeys.deadStock.nearbyShops(lat ?? 0, lng ?? 0, radiusKm),
    queryFn: async () =>
      api.get<ApiResponse<{ shops: DsShopWithDistance[] }>>(
        "/dead-stock/shops/nearby/",
        { params: { lat, lng, radius_km: radiusKm } }
      ),
    select: (r) => r.data.data.shops,
    enabled: lat !== null && lng !== null,
  });
};

export const useCreateShop = () => {
  return useMutation({
    mutationFn: async (payload: DsCreateShopPayload) =>
      api.post<ApiResponse<DsShop>>("/dead-stock/shops/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myShop });
    },
  });
};

export const useUpdateShop = () => {
  return useMutation({
    mutationFn: async (payload: Partial<DsCreateShopPayload>) =>
      api.patch<ApiResponse<DsShop>>("/dead-stock/shops/me/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.myShop });
    },
  });
};
