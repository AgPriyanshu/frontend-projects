import { Container } from "@chakra-ui/react";
import { TodoList } from "./todo-list";

export const TodoPage = () => {
  return (
    <Container gap={4} centerContent mt={4}>
      <TodoList />
    </Container>
  );
};
