import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { FiSidebar, FiTrash2, FiWifi, FiWifiOff, FiX } from "react-icons/fi";
import { chatStore } from "../../store/chat-store";
import { ConnectionStatus } from "../../store/types";

type ChatPanelTitleProps = {
  activeSessionId: string | null;
  connectionStatus: ConnectionStatus;
  isSessionListOpen: boolean;
  isDeletingSession: boolean;
  onDeleteSession: () => void;
};

export const ChatPanelTitle: React.FC<ChatPanelTitleProps> = ({
  activeSessionId,
  connectionStatus,
  isSessionListOpen,
  isDeletingSession,
  onDeleteSession,
}) => {
  return (
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
            connectionStatus === ConnectionStatus.Connected
              ? "intent.success"
              : connectionStatus === ConnectionStatus.Connecting
                ? "intent.warning"
                : "text.muted"
          }
          transition="background 0.3s ease"
        />
        <Text fontSize="sm" fontWeight={600} color="text.primary">
          Atlas AI
        </Text>
        <Text fontSize="xs" color="text.muted">
          {connectionStatus === ConnectionStatus.Connected
            ? "Online"
            : connectionStatus === ConnectionStatus.Connecting
              ? "Connecting…"
              : "Offline"}
        </Text>
      </Flex>

      <Flex gap={1}>
        {connectionStatus !== ConnectionStatus.Connected && activeSessionId && (
          <IconButton
            aria-label="Connection status"
            size="xs"
            variant="ghost"
            color="text.muted"
          >
            <FiWifiOff size={14} />
          </IconButton>
        )}
        {connectionStatus === ConnectionStatus.Connected && (
          <IconButton
            aria-label="Connected"
            size="xs"
            variant="ghost"
            color="intent.success"
          >
            <FiWifi size={14} />
          </IconButton>
        )}
        {activeSessionId && (
          <IconButton
            aria-label="Delete session"
            size="xs"
            variant="ghost"
            color="text.muted"
            _hover={{ color: "intent.danger", bg: "surface.hover" }}
            onClick={onDeleteSession}
            loading={isDeletingSession}
          >
            <FiTrash2 size={14} />
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
  );
};
