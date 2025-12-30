import { Button, Container, Text, VStack } from "@chakra-ui/react";

export const App = () => {
  return (
    <Container minH="100vh" centerContent>
      <VStack flex="1" justify="center" gap="4">
        <Text fontSize="lg">Welcome to the World of Apps</Text>
        <Button>Test</Button>
      </VStack>
    </Container>
  );
};
