import { Flex } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { chatStore } from "../store/chat-store";
import { MessageBubble } from "./message-bubble";
import { EmptyMessageList } from "./message-list-empty";
import { TypingIndicator } from "./typing-indicator";

export const MessageList = observer(() => {
  // Refs.
  const bottomRef = useRef<HTMLDivElement>(null);

  // Stores.
  const { messages, isWaitingForResponse, agentStatus } = chatStore;

  // useEffects.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isWaitingForResponse]);

  // Renders.
  if (messages.length === 0 && !isWaitingForResponse) {
    return <EmptyMessageList />;
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
      {isWaitingForResponse && <TypingIndicator status={agentStatus} />}
      <div ref={bottomRef} />
    </Flex>
  );
});
