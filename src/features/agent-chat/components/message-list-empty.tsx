import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";

export const EmptyMessageList = () => {
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
};
