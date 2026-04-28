import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import { EnvVariable } from "app/config";
import { isEmpty, isNil } from "lodash";
import { useEffect, useState } from "react";
import { getAccessToken } from "shared/local-storage";
import { toCamelCase } from "shared/utils";
import type { AxiosResponse } from "axios";
import type { ProcessingJobResponse } from "api/web-gis/types";
import type { Notification } from "./types";

type ProcessingProgressMessage = {
  type: "processing_progress";
  jobId: string;
  toolName: string;
  progress: number;
  message: string;
};

type ProcessingCompleteMessage = {
  type: "processing_complete";
  jobId: string;
  toolName: string;
  outputDatasetId: string | null;
};

type ProcessingFailedMessage = {
  type: "processing_failed";
  jobId: string;
  toolName: string;
  error: string;
};

type ProcessingMessage =
  | ProcessingProgressMessage
  | ProcessingCompleteMessage
  | ProcessingFailedMessage;

const tryParseProcessingMessage = (
  content: string
): ProcessingMessage | null => {
  try {
    const parsed = JSON.parse(content);

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.type === "string" &&
      parsed.type.startsWith("processing_")
    ) {
      return toCamelCase(parsed) as ProcessingMessage;
    }
  } catch {
    // Not a JSON processing payload, treat as a regular notification.
  }

  return null;
};

const applyProcessingMessage = (message: ProcessingMessage) => {
  if (message.type === "processing_progress") {
    // The cache holds the raw AxiosResponse; select() is applied at consumption time.
    queryClient.setQueryData(
      QueryKeys.processingJobs,
      (
        oldResponse:
          | AxiosResponse<ApiResponse<ProcessingJobResponse[]>>
          | undefined
      ) => {
        const existing = oldResponse?.data?.data ?? [];

        const updated = existing.map((job) =>
          job.id === message.jobId
            ? {
                ...job,
                progress: message.progress,
                status: "processing" as const,
              }
            : job
        );

        return {
          ...oldResponse,
          data: { meta: oldResponse?.data?.meta, data: updated },
        };
      }
    );
    return;
  }

  if (message.type === "processing_complete") {
    queryClient.invalidateQueries({ queryKey: QueryKeys.processingJobs });
    queryClient.invalidateQueries({ queryKey: QueryKeys.datasets });
    queryClient.invalidateQueries({ queryKey: QueryKeys.layers });
    return;
  }

  if (message.type === "processing_failed") {
    queryClient.invalidateQueries({ queryKey: QueryKeys.processingJobs });
  }
};

const applyDeadStockMessage = (message: { type: string }) => {
  if (message.type === "dead_stock.lead_created") {
    queryClient.invalidateQueries({ queryKey: QueryKeys.deadStock.leadInbox });
  }
};

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
        const rawParsed = JSON.parse(event.data);

        if (
          typeof rawParsed.type === "string" &&
          rawParsed.type.startsWith("dead_stock.")
        ) {
          applyDeadStockMessage(rawParsed);
          return;
        }

        const newNotification = toCamelCase(rawParsed) as Notification;

        const processingMessage = tryParseProcessingMessage(
          newNotification.content
        );

        if (processingMessage) {
          applyProcessingMessage(processingMessage);
          return;
        }

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
