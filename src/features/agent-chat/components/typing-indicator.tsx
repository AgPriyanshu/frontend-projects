import { Flex, Box, Text } from "@chakra-ui/react";

interface TypingIndicatorProps {
  status?: string | null;
}

export const TypingIndicator = ({ status }: TypingIndicatorProps) => {
  return (
    <Flex className="typing-indicator" px={4} alignItems="flex-start" gap={2.5}>
      <Flex
        shrink={0}
        w={7}
        h={7}
        borderRadius="full"
        alignItems="center"
        justifyContent="center"
        bg="surface.subtle"
        mt={0.5}
      >
        <Box w={2} h={2} borderRadius="full" bg="text.muted" />
      </Flex>

      <Flex
        bg="surface.subtle"
        borderRadius="xl"
        borderTopLeftRadius="4px"
        px={5}
        py={3.5}
        gap={1.5}
        alignItems="center"
        css={{
          "@keyframes typingBounce": {
            "0%, 80%, 100%": { transform: "scale(0)", opacity: 0.4 },
            "40%": { transform: "scale(1)", opacity: 1 },
          },
        }}
      >
        {status ? (
          <Text fontSize="sm" color="text.muted">
            {status}
          </Text>
        ) : (
          [0, 1, 2].map((i) => (
            <Box
              key={i}
              w={2}
              h={2}
              borderRadius="full"
              bg="text.muted"
              css={{
                animation: "typingBounce 1.2s infinite ease-in-out",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))
        )}
      </Flex>
    </Flex>
  );
};
