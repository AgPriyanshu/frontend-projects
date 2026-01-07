import { Box, Container, VStack } from "@chakra-ui/react";
import { TodoList } from "./todo-list";

export const TodoPage = () => {
  return (
    <Box w="full" p={8}>
      <Container gap={4} centerContent>
        <TodoList />
      </Container>
    </Box>
  );
};
