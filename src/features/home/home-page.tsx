import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export const HomePage = () => {
  return (
    <Box w="full" p={8}>
      <VStack gap={4} align="center">
        <Heading size="2xl">Welcome to World of Apps</Heading>
        <Text fontSize="lg" color="fg.muted">
          You are successfully logged in!
        </Text>
      </VStack>
    </Box>
  );
};
