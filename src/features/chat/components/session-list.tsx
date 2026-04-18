import { Flex, Text, IconButton, VStack, Spinner } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useLLMs,
} from "api/chat";
import type { ChatSessionResponse } from "api/chat/types";
import { chatStore } from "../store/chat-store";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useState } from "react";
import { DeleteIconButton } from "shared/components";

const SessionItem = ({
  session,
  isActive,
  onSelect,
}: {
  session: ChatSessionResponse;
  isActive: boolean;
  onSelect: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const deleteSession = useDeleteChatSession(session.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession.mutate(undefined, {
      onSuccess: () => {
        if (chatStore.activeSessionId === session.id) {
          chatStore.setActiveSession(null);
        }
        queryClient.invalidateQueries({ queryKey: QueryKeys.chatSessions });
      },
    });
  };

  return (
    <Flex
      className="session-item"
      w={"full"}
      h={"2rem"}
      px={3}
      py={2}
      cursor="pointer"
      gap={2.5}
      bg={isActive ? "surface.hover" : "transparent"}
      _hover={{ bg: "surface.hover" }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="all 0.15s ease"
      alignItems={"center"}
    >
      <Text
        fontSize="xs"
        flex={1}
        truncate
        color={isActive ? "text.primary" : "text.secondary"}
        fontWeight={isActive ? 500 : 400}
      >
        {session.name}
      </Text>
      {isHovered && <DeleteIconButton size={"2xs"} onClick={handleDelete} />}
    </Flex>
  );
};

export const SessionList = observer(() => {
  const { data, isLoading } = useChatSessions();
  const { data: llmData } = useLLMs();
  const createSession = useCreateChatSession();

  const sessions = data?.data ?? [];
  const llms = llmData?.data ?? [];

  const handleCreateSession = () => {
    const firstLlm = llms[0]?.id ?? null;
    createSession.mutate(
      { name: `Chat ${sessions.length + 1}`, llm: firstLlm },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries({
            queryKey: QueryKeys.chatSessions,
          });
          const newSession = response.data?.data;
          if (newSession?.id) {
            chatStore.setActiveSession(newSession.id);
          }
        },
      }
    );
  };

  const handleSelectSession = (sessionId: string) => {
    chatStore.setActiveSession(sessionId);
    chatStore.toggleSessionList();
  };

  return (
    <VStack
      className="session-list"
      w="200px"
      minW="200px"
      borderLeftWidth="1px"
      borderColor="border.default"
      bg="surface.container"
      gap={0}
      h="full"
    >
      {/* Header */}
      <Flex
        w="full"
        px={3}
        py={2.5}
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth="1px"
        borderColor="border.muted"
      >
        <Text
          fontSize="xs"
          fontWeight={600}
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing="0.05em"
        >
          Sessions
        </Text>
        <IconButton
          aria-label="New chat session"
          size="2xs"
          variant="ghost"
          color="text.muted"
          _hover={{ color: "intent.primary", bg: "surface.hover" }}
          onClick={handleCreateSession}
          loading={createSession.isPending}
        >
          <FiPlus size={14} />
        </IconButton>
      </Flex>

      {/* Session list */}
      <VStack
        flex={1}
        w="full"
        overflowY="auto"
        gap={0.5}
        css={{
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-track": { bg: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bg: "border.default",
            borderRadius: "full",
          },
        }}
      >
        {isLoading && (
          <Flex py={6} justifyContent="center">
            <Spinner size="sm" color="text.muted" />
          </Flex>
        )}
        {sessions.map((session: ChatSessionResponse) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={chatStore.activeSessionId === session.id}
            onSelect={() => handleSelectSession(session.id)}
          />
        ))}
        {!isLoading && sessions.length === 0 && (
          <Text
            fontSize="xs"
            color="text.muted"
            textAlign="center"
            py={6}
            px={2}
          >
            No sessions yet. Click + to start a new chat.
          </Text>
        )}
      </VStack>
    </VStack>
  );
});
