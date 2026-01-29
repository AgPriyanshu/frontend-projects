import { Box, Flex, Input } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useAddTodo } from "api/todo";
import { toaster } from "design-system/toaster";
import { useState } from "react";
import { LuPenLine } from "react-icons/lu";

export const TodoInput = () => {
  const [taskInput, setTaskInput] = useState("");
  const { mutate: sendAddTodo, isPending } = useAddTodo();

  // Handlers
  const handleAddTask = () => {
    if (taskInput.trim()) {
      sendAddTodo(
        { description: taskInput.trim() },
        {
          onSuccess: () => {
            toaster.create({
              description: "Todo added Successfully",
              type: "success",
            });
            queryClient.invalidateQueries({ queryKey: QueryKeys.todoList });
          },
        }
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && taskInput.trim()) {
      handleAddTask();
    }
  };

  return (
    <Flex w="full" gap={3} mb={8} align="center">
      <Flex
        flex={1}
        align="center"
        gap={3}
        px={4}
        py={3}
        bg="bg"
        border="1px solid"
        borderColor="border.default"
        borderRadius="lg"
      >
        <Box color="text.muted" fontSize="lg">
          <LuPenLine />
        </Box>
        <Input
          placeholder="Add a new task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyUp={handleKeyPress}
          _placeholder={{ color: "text.muted" }}
          disabled={isPending}
        />
      </Flex>
    </Flex>
  );
};
