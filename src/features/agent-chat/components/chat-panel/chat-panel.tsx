import { Box, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { ResizableBox } from "react-resizable";
import useResizeObserver from "use-resize-observer";
import type { AxiosResponse } from "axios";
import {
  useChatMessages,
  useChatSessions,
  useDeleteChatSession,
} from "api/chat";
import type { ChatSessionListResponse } from "api/chat/types";
import type { ApiResponse } from "api/types";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { DEFAULT_WIDTH, MAX_WIDTH, MIN_WIDTH } from "../../constants";
import { useWebSocket } from "../../hooks/use-websocket/use-websocket";
import { chatStore } from "../../store/chat-store";
import { ChatPanelBody } from "./chat-panel-body";
import { ChatPanelTitle } from "./chat-panel-title";

export const ChatPanel = observer(() => {
  const {
    isPanelOpen,
    activeSessionId,
    connectionStatus,
    isWaitingForResponse,
    isSessionListOpen,
  } = chatStore;

  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);

  const { ref: containerRef, height: containerHeight = 600 } =
    useResizeObserver<HTMLDivElement>();

  const { data: sessionsData } = useChatSessions();
  const { data: historicalMessages } = useChatMessages(activeSessionId);
  const { sendMessage, stopResponse } = useWebSocket(
    isPanelOpen ? activeSessionId : null
  );
  const deleteSession = useDeleteChatSession(activeSessionId ?? "");

  useEffect(() => {
    if (!isPanelOpen || activeSessionId !== null) return;
    const sessions = sessionsData?.data ?? [];
    if (sessions.length === 0) return;
    const latest = [...sessions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    chatStore.setActiveSession(latest.id);
  }, [isPanelOpen, sessionsData, activeSessionId]);

  useEffect(() => {
    if (!historicalMessages || historicalMessages.length === 0) return;
    chatStore.loadHistory(historicalMessages);
  }, [historicalMessages]);

  const handleSend = (message: string) => {
    chatStore.addOptimisticMessage(message, 0);
    sendMessage(message);
  };

  const handleDeleteSession = () => {
    if (!activeSessionId) return;
    const deletedId = activeSessionId;

    deleteSession.mutate(undefined, {
      onSuccess: () => {
        // Optimistically remove the deleted session from cache before clearing
        // activeSessionId — otherwise the auto-select effect fires while the
        // stale list still contains the deleted session and immediately re-selects it.
        queryClient.setQueryData(
          QueryKeys.chatSessions,
          (
            old: AxiosResponse<ApiResponse<ChatSessionListResponse>> | undefined
          ) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                data: (old.data.data ?? []).filter((s) => s.id !== deletedId),
              },
            };
          }
        );
        chatStore.setActiveSession(null);
        queryClient.invalidateQueries({ queryKey: QueryKeys.chatSessions });
      },
    });
  };

  const handleResize = useCallback(
    (_: unknown, { size }: { size: { width: number } }) => {
      setPanelWidth(size.width);
    },
    []
  );

  if (!isPanelOpen) {
    return null;
  }

  return (
    <Box
      className="chat-panel-container"
      ref={containerRef}
      h="full"
      position="relative"
    >
      <ResizableBox
        width={panelWidth}
        height={containerHeight}
        handleSize={[8, 8]}
        lockAspectRatio={false}
        transformScale={1}
        minConstraints={[MIN_WIDTH, containerHeight]}
        maxConstraints={[MAX_WIDTH, containerHeight]}
        axis="x"
        resizeHandles={["w"]}
        onResize={handleResize}
        handle={
          <Box
            className="chat-panel-resize-handle"
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w="6px"
            cursor="col-resize"
            zIndex={10}
            transition="background 0.15s ease"
            _hover={{ bg: "intent.primary" }}
            _active={{ bg: "intent.primary" }}
            css={{
              "&::after": {
                content: '""',
                position: "absolute",
                left: "2px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "2px",
                height: "32px",
                borderRadius: "full",
                background: "var(--chakra-colors-border-default)",
                transition: "background 0.15s ease",
              },
              "&:hover::after": {
                background: "var(--chakra-colors-intent-primary)",
              },
            }}
          />
        }
      >
        <VStack
          className="chat-panel"
          w="full"
          h="full"
          gap={0}
          borderLeftWidth="1px"
          borderColor="border.default"
          bg="surface.container"
        >
          <ChatPanelTitle
            connectionStatus={connectionStatus}
            isSessionListOpen={isSessionListOpen}
            activeSessionId={activeSessionId}
            isDeletingSession={deleteSession.isPending}
            onDeleteSession={handleDeleteSession}
          />
          <ChatPanelBody
            handleSend={handleSend}
            handleStop={stopResponse}
            activeSessionId={activeSessionId}
            isWaitingForResponse={isWaitingForResponse}
            connectionStatus={connectionStatus}
            isSessionListOpen={isSessionListOpen}
          />
        </VStack>
      </ResizableBox>
    </Box>
  );
});
