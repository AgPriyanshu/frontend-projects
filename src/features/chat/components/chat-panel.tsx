import { Flex, Text, IconButton, Box, VStack } from "@chakra-ui/react";
import { FiX, FiWifi, FiWifiOff } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import { chatStore } from "../store/chat-store";
import { useWebSocket } from "../hooks/use-websocket";
import { SessionList } from "./session-list";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

export const ChatPanel = observer(() => {
  const {
    isPanelOpen,
    activeSessionId,
    connectionStatus,
    isWaitingForResponse,
  } = chatStore;

  const { sendMessage } = useWebSocket(isPanelOpen ? activeSessionId : null);

  const handleSend = (message: string) => {
    chatStore.addOptimisticMessage(message, 0);
    sendMessage(message);
  };

  if (!isPanelOpen) return null;

  return (
    <VStack
      w="420px"
      minW="420px"
      h="full"
      gap={0}
      borderLeftWidth="1px"
      borderColor="border.default"
      bg="surface.container"
    >
      {/* Title bar */}
      <Flex
        w="full"
        px={4}
        py={2.5}
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

      {/* Body: sidebar + messages */}
      <Flex flex={1} overflow="hidden" w="full">
        <SessionList />

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
            <Flex flex={1} alignItems="center" justifyContent="center" px={6}>
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
      </Flex>
    </VStack>
  );
});
