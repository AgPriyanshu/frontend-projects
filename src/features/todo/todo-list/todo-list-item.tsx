import { List, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuCircleDashed } from "react-icons/lu";
import type { Task } from "../types";

type TodoListItemProps = {
  task: Task;
};

export const TodoListItem: React.FC<TodoListItemProps> = ({ task }) => {
  return (
    <List.Item>
      <List.Indicator asChild color="green.500">
        {task.isCompleted ? <LuCircleCheck /> : <LuCircleDashed />}
      </List.Indicator>
      <Text>{task.description}</Text>
    </List.Item>
  );
};
