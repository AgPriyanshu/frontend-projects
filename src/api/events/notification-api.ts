import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { Notification, UpdateNotificationsPayload } from "./types";

export const useNotifications = () => {
  return useQuery({
    queryKey: QueryKeys.notifications,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Notification[]>>(
        QueryKeys.notifications[0]
      );
      return response.data;
    },
  });
};

export const useUpdateNotifications = () => {
  return useMutation({
    mutationFn: async (payload: UpdateNotificationsPayload) => {
      return await api.patch(QueryKeys.notificationsBulk[0], payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.notifications,
      });
    },
  });
};

export const useUpdateNotification = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.post(QueryKeys.notification(id)[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.notifications,
      });
    },
  });
};
