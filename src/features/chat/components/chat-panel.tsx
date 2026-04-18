import { useState, useCallback } from "react";
import { Flex, Text, IconButton, Box, VStack } from "@chakra-ui/react";
import { ResizableBox } from "react-resizable";
import { FiX, FiWifi, FiWifiOff, FiSidebar } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import useResizeObserver from "use-resize-observer";
import { chatStore } from "../store/chat-store";
import { useWebSocket } from "../hooks/use-websocket";
import { SessionList } from "./session-list";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

const MIN_WIDTH = 360;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 480;

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

  const { sendMessage } = useWebSocket(isPanelOpen ? activeSessionId : null);

  const handleSend = (message: string) => {
    chatStore.addOptimisticMessage(message, 0);
    sendMessage(message);
  };

  const handleResize = useCallback(
    (_: unknown, { size }: { size: { width: number } }) => {
      setPanelWidth(size.width);
    },
    []
  );

  if (!isPanelOpen) return null;

  return (
    <Box ref={containerRef} h="full" position="relative">
      <ResizableBox
        width={panelWidth}
        height={containerHeight}
        minConstraints={[MIN_WIDTH, containerHeight]}
        maxConstraints={[MAX_WIDTH, containerHeight]}
        axis="x"
        resizeHandles={["w"]}
        onResize={handleResize}
        handle={
          <Box
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
          w="full"
          h="full"
          gap={0}
          borderLeftWidth="1px"
          borderColor="border.default"
          bg="surface.container"
        >
          {/* Title bar */}
          <Flex
            w="full"
            px={3}
            py={2}
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth="1px"
            borderColor="border.default"
            bg="surface.subtle"
            shrink={0}
          >
            <Flex alignItems="center" gap={2}>
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={
                  connectionStatus === "connected"
                    ? "intent.success"
                    : connectionStatus === "connecting"
                      ? "intent.warning"
                      : "text.muted"
                }
                transition="background 0.3s ease"
              />
              <Text fontSize="sm" fontWeight={600} color="text.primary">
                Atlas AI
              </Text>
              <Text fontSize="xs" color="text.muted">
                {connectionStatus === "connected"
                  ? "Online"
                  : connectionStatus === "connecting"
                    ? "Connecting…"
                    : "Offline"}
              </Text>
            </Flex>

            <Flex gap={1}>
              {connectionStatus !== "connected" && activeSessionId && (
                <IconButton
                  aria-label="Connection status"
                  size="xs"
                  variant="ghost"
                  color="text.muted"
                >
                  <FiWifiOff size={14} />
                </IconButton>
              )}
              {connectionStatus === "connected" && (
                <IconButton
                  aria-label="Connected"
                  size="xs"
                  variant="ghost"
                  color="intent.success"
                >
                  <FiWifi size={14} />
                </IconButton>
              )}
              <IconButton
                aria-label="Toggle sessions"
                size="xs"
                variant="ghost"
                color={isSessionListOpen ? "intent.primary" : "text.muted"}
                _hover={{ color: "intent.primary", bg: "surface.hover" }}
                onClick={() => chatStore.toggleSessionList()}
              >
                <FiSidebar size={14} />
              </IconButton>
              <IconButton
                aria-label="Close chat"
                size="xs"
                variant="ghost"
                color="text.muted"
                _hover={{ color: "text.primary", bg: "surface.hover" }}
                onClick={() => chatStore.closePanel()}
              >
                <FiX size={16} />
              </IconButton>
            </Flex>
          </Flex>

          {/* Body */}
          <Flex flex={1} overflow="hidden" w="full">
            {/* Chat area */}
            <Flex direction="column" flex={1} minW={0}>
              {activeSessionId ? (
                <>
                  <MessageList />
                  <ChatInput
                    onSend={handleSend}
                    disabled={
                      connectionStatus !== "connected" || isWaitingForResponse
                    }
                  />
                </>
              ) : (
                <Flex
                  flex={1}
                  alignItems="center"
                  justifyContent="center"
                  px={6}
                >
                  <Text
                    fontSize="sm"
                    color="text.muted"
                    textAlign="center"
                    lineHeight={1.6}
                  >
                    Select a session or create a new one to start chatting.
                  </Text>
                </Flex>
              )}
            </Flex>
            {/* Collapsible session sidebar */}
            {isSessionListOpen && <SessionList />}
          </Flex>
        </VStack>
      </ResizableBox>
    </Box>
  );
});
