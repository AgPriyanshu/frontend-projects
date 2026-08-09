import { useCallback, useEffect, useRef } from "react";
import { EnvVariable } from "app/config/env-variables";
import { getAccessToken } from "shared/local-storage/token";
import type {
  AgentStatusMessage,
  WebSocketIncomingMessage,
  WebSocketErrorMessage,
} from "api/chat/types";
import { chatStore } from "../../store";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

export const useWebSocket = (sessionId: string | null) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectRef = useRef<() => void>(undefined);
  const cleanupRef = useRef<() => void>(undefined);

  const sendMessage = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ message, ...(context && { context }) })
        );
      }
    },
    []
  );

  const stopResponse = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
    }
    chatStore.stopWaiting();
  }, []);

  const disconnect = useCallback(() => {
    cleanupRef.current?.();
    chatStore.setConnectionStatus("disconnected");
  }, []);

  const reconnect = useCallback(() => reconnectRef.current?.(), []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const cleanup = () => {
      clearTimeout(reconnectTimeout.current);

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    cleanupRef.current = cleanup;

    const connect = () => {
      cleanup();
      chatStore.setConnectionStatus("connecting");

      const token = getAccessToken();
      const ws = new WebSocket(
        `${EnvVariable.WS_BASE_URL}/ws/ai/sessions/${sessionId}/?token=${token ?? ""}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        chatStore.setConnectionStatus("connected");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data) as
            | WebSocketIncomingMessage
            | WebSocketErrorMessage
            | AgentStatusMessage;

          if ("error" in msg) {
            console.error("[WebSocket] Server error:", msg.error);
            return;
          }

          if ("type" in msg && msg.type === "agent_status") {
            chatStore.setAgentStatus((msg as AgentStatusMessage).status);
            return;
          }

          chatStore.handleIncomingMessage(msg as WebSocketIncomingMessage);
        } catch {
          console.error("[WebSocket] Failed to parse message:", event.data);
        }
      };

      ws.onclose = (event: CloseEvent) => {
        chatStore.setConnectionStatus("disconnected");

        if (event.code === 1000 || event.code === 4401 || event.code === 4404) {
          return;
        }

        // Exponential backoff via ref so onclose always calls the latest connect.
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay =
            BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current);
          reconnectAttempts.current += 1;
          reconnectTimeout.current = setTimeout(
            () => reconnectRef.current?.(),
            delay
          );
        }
      };
    };
    reconnectRef.current = connect;

    connect();
    return cleanup;
  }, [sessionId]);

  return { sendMessage, stopResponse, disconnect, reconnect };
};
