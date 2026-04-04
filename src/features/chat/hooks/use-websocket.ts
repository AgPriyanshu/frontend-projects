import { useCallback, useEffect, useRef } from "react";
import { EnvVariable } from "app/config/env-variables";
import { getAccessToken } from "shared/local-storage/token";
import { chatStore } from "../store/chat-store";
import type {
  WebSocketIncomingMessage,
  WebSocketErrorMessage,
} from "api/chat/types";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

export const useWebSocket = (sessionId: string | null) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const connectRef = useRef<() => void>(undefined);

  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!sessionId) return;

    cleanup();
    chatStore.setConnectionStatus("connecting");

    const token = getAccessToken();
    const wsUrl = `${EnvVariable.WS_BASE_URL}/ws/ai/sessions/${sessionId}/?token=${token ?? ""}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      chatStore.setConnectionStatus("connected");
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as
          | WebSocketIncomingMessage
          | WebSocketErrorMessage;

        if ("error" in data) {
          console.error("[WebSocket] Server error:", data.error);
          return;
        }

        chatStore.handleIncomingMessage(data);
      } catch {
        console.error("[WebSocket] Failed to parse message:", event.data);
      }
    };

    ws.onclose = (event: CloseEvent) => {
      chatStore.setConnectionStatus("disconnected");

      if (event.code === 1000 || event.code === 4401 || event.code === 4404) {
        return;
      }

      // Exponential backoff reconnect via ref to avoid circular dependency
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay =
          BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current);
        reconnectAttempts.current += 1;
        reconnectTimeout.current = setTimeout(() => {
          connectRef.current?.();
        }, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after this — reconnect logic lives there
    };
  }, [sessionId, cleanup]);

  // Keep ref in sync so onclose can call the latest connect
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    chatStore.setConnectionStatus("disconnected");
  }, [cleanup]);

  useEffect(() => {
    connect();
    return () => {
      cleanup();
    };
  }, [connect, cleanup]);

  return { sendMessage, disconnect, reconnect: connect };
};
