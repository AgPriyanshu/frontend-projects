import { Box, Flex, Text } from "@chakra-ui/react";
import { FaRobot, FaUser } from "react-icons/fa";
import type { ChatMessageResponse } from "api/chat/types";
import { MessageContent } from "./message-content";

interface MessageBubbleProps {
  message: ChatMessageResponse;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <Flex
      direction="column"
      alignItems={isUser ? "flex-end" : "flex-start"}
      w="full"
      px={4}
    >
      <Flex
        gap={2.5}
        maxW="85%"
        direction={isUser ? "row-reverse" : "row"}
        alignItems="flex-start"
      >
        {/* Avatar */}
        <Flex
          shrink={0}
          w={7}
          h={7}
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
          bg={isUser ? "intent.primary" : "surface.subtle"}
          color={isUser ? "text.onIntent" : "text.primary"}
          mt={0.5}
        >
          {isUser ? <FaUser size={12} /> : <FaRobot size={12} />}
        </Flex>

        {/* Bubble */}
        <Box
          bg={isUser ? "intent.primary" : "surface.subtle"}
          color={isUser ? "text.onIntent" : "text.primary"}
          borderRadius="xl"
          px={4}
          py={2.5}
          transition="all 0.2s ease"
          css={
            isUser
              ? {
                  borderTopRightRadius: "4px",
                }
              : {
                  borderTopLeftRadius: "4px",
                }
          }
        >
          {isUser ? (
            <Text fontSize="sm" lineHeight={1.6}>
              {message.message}
            </Text>
          ) : (
            <Box fontSize="sm">
              <MessageContent content={message.message} />
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};
