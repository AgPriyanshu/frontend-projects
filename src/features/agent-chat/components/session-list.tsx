import { Flex, IconButton, Spinner, Text, VStack } from "@chakra-ui/react";
import { useChatSessions, useCreateChatSession, useLLMs } from "api/agent-chat";
import type { ChatSessionResponse } from "api/agent-chat/types";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { observer } from "mobx-react-lite";
import { FiPlus } from "react-icons/fi";
import { chatStore } from "../store/chat-store";
import { SessionItem } from "./session-item";

export const SessionList = observer(() => {
  // APIs.
  const { data, isLoading } = useChatSessions();
  const { data: llmData } = useLLMs();
  const createSession = useCreateChatSession();

  // Variables.
  const sessions = data?.data ?? [];
  const llms = llmData?.data ?? [];

  // Handlers.
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

  // Render.
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
