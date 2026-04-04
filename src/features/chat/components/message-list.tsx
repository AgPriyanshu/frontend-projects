import { useEffect, useRef } from "react";
import { Flex, Box, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FaRobot } from "react-icons/fa";
import { chatStore } from "../store/chat-store";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

export const MessageList = observer(() => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, isWaitingForResponse } = chatStore;

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isWaitingForResponse]);

  if (messages.length === 0 && !isWaitingForResponse) {
    return (
      <Flex
        flex={1}
        alignItems="center"
        justifyContent="center"
        direction="column"
        gap={3}
        opacity={0.5}
        px={6}
      >
        <Box
          w={12}
          h={12}
          borderRadius="full"
          bg="surface.subtle"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FaRobot size={24} />
        </Box>
        <VStack gap={1}>
          <Text fontSize="sm" fontWeight={500} color="text.secondary">
            Atlas AI Assistant
          </Text>
          <Text fontSize="xs" color="text.muted" textAlign="center">
            Ask me anything about your projects — GIS, tasks, URLs, and more.
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Flex
      flex={1}
      direction="column"
      gap={3}
      overflowY="auto"
      py={4}
      css={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { bg: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bg: "border.default",
          borderRadius: "full",
        },
      }}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isWaitingForResponse && <TypingIndicator />}
      <div ref={bottomRef} />
    </Flex>
  );
});
