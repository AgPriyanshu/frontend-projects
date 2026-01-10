import { Box, Flex, Heading, List, Text } from "@chakra-ui/react";
import { useTodoList } from "api/todo";
import { TodoInput } from "./todo-input";
import { TodoListItem } from "./todo-list-item";

export const TodoList = () => {
  // APIs
  const { data: taskList } = useTodoList();

  // Calculate task statistics
  const taskStats = (() => {
    if (!taskList?.data) {
      return { total: 0, completed: 0 };
    }

    const total = taskList.data.length;
    const completed = taskList.data.filter((task) => task.isCompleted).length;

    return { total, completed };
  })();

  return (
    <Box w="full" maxW="3xl">
      {/* Add Task Input Section */}
      <TodoInput />
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" fontWeight="semibold" color="fg">
          Today's Tasks
        </Heading>
        <Text
          fontSize="xs"
          fontWeight="medium"
          color="fgMuted"
          letterSpacing="wide"
          textTransform="uppercase"
        >
          {taskStats.total} TASKS • {taskStats.completed} COMPLETED
        </Text>
      </Flex>

      {/* Task List */}
      <List.Root gap="3" variant="plain">
        {taskList?.data.map((task, index) => {
          return <TodoListItem task={task} key={"todoListItem-" + index} />;
        })}
      </List.Root>
    </Box>
  );
};
