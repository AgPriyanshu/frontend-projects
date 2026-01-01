import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export const TodoPage = () => {
  return (
    <Box w="full" p={8}>
      <VStack gap={4} align="center">
        <Heading size="2xl">Todo List</Heading>
        <Text fontSize="lg" color="fg.muted">
          Your tasks will appear here
        </Text>
      </VStack>
    </Box>
  );
};
