import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import { EnvVariable } from "app/config";
import { isEmpty, isNil } from "lodash";
import { useEffect, useState } from "react";
import { getAccessToken } from "shared/local-storage";
import { toCamelCase } from "shared/utils";
import type { Notification } from "./types";

export const useNotificationStream = () => {
  const [isConnected, setIsConnected] = useState(false);

  const updateNotificationsList = (newNotification: Notification) => {
    // Update the query cache by prepending the new notification.
    queryClient.setQueryData(
      QueryKeys.notifications,
      (oldResponse: ApiResponse<Notification[]> | undefined) => {
        const responseData = oldResponse?.data;

        const existingNotifications =
          !isNil(responseData) && !isEmpty(responseData) ? responseData : [];

        const newNotificationArray = [
          newNotification,
          ...existingNotifications,
        ];

        return {
          meta: oldResponse?.meta,
          data: newNotificationArray,
        };
      }
    );
  };

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      return;
    }

    const eventSource = new EventSource(
      `${EnvVariable.API_BASE_URL}/events/?token=${token}`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      try {
        const newNotification = toCamelCase(
          JSON.parse(event.data)
        ) as Notification;

        updateNotificationsList(newNotification);
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
};
