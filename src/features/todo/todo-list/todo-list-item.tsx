import { CheckboxCard, Flex, IconButton, List } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useDeleteTodo, useUpdateTodo } from "api/todo";
import { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import type { CheckedChangeDetails, TodoListItemProps } from "./types";

export const TodoListItem: React.FC<TodoListItemProps> = ({ task }) => {
  // States.
  const [checked, setChecked] = useState(task.isCompleted);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);

  // APIs.
  const { mutate: updateTodoItem } = useUpdateTodo(task.id);
  const { mutate: deleteTodoItem, isPending } = useDeleteTodo(task.id);

  // Handlers.
  const onCheckChangeHandler = (details: CheckedChangeDetails) => {
    const isChecked = !!details.checked;
    setChecked(isChecked);
    updateTodoItem({
      isCompleted: isChecked,
    });
  };

  // Handler.
  const onClickDelete = () => {
    deleteTodoItem(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.todoList });
      },
    });
  };

  return (
    <List.Item>
      <Flex gap={3} align="center">
        <CheckboxCard.Root
          w="3xl"
          checked={checked}
          onCheckedChange={onCheckChangeHandler}
          _checked={{ borderColor: "inherit", boxShadow: "none" }}
          borderColor={isDeleteHovered ? "red.500" : undefined}
          transition="border-color 0.2s ease-in-out"
        >
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control display="flex" alignItems="center" gap={3}>
            {/* Checkbox Indicator - Left */}
            <CheckboxCard.Indicator
              _checked={{
                color: "white",
                borderColor: "primaryActive",
                bgColor: "primaryActive",
              }}
              borderRadius={"xl"}
            />

            {/* Task Description - Middle */}
            <CheckboxCard.Label
              _checked={{ textDecoration: "line-through", color: "fgMuted" }}
              flex={1}
              cursor="pointer"
            >
              {task.description}
            </CheckboxCard.Label>
          </CheckboxCard.Control>
        </CheckboxCard.Root>

        {/* Delete Button - Outside CheckboxCard */}
        <IconButton
          aria-label="Delete todo"
          colorPalette="red"
          onClick={onClickDelete}
          size="sm"
          loading={isPending}
          onMouseEnter={() => setIsDeleteHovered(true)}
          onMouseLeave={() => setIsDeleteHovered(false)}
        >
          <FaRegTrashCan />
        </IconButton>
      </Flex>
    </List.Item>
  );
};
