import { List } from "@chakra-ui/react";
import { useTodoList } from "api/todo";
import { TodoListItem } from "./todo-list-item";

export const TodoList = () => {
  // APIs.
  const { data: taskList } = useTodoList();

  return (
    <List.Root gap="2" variant="plain" align="center">
      {taskList?.data.map((task) => {
        return <TodoListItem task={task} />;
      })}
    </List.Root>
  );
};
