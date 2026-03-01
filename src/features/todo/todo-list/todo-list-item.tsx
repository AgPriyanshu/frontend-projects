import { CheckboxCard, Flex, List } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useDeleteTodo, useUpdateTodo } from "api/todo";
import { useState } from "react";
import type { CheckedChangeDetails, TodoListItemProps } from "./types";
import { DeleteIconButton } from "shared/components";

export const TodoListItem: React.FC<TodoListItemProps> = ({ task }) => {
  // States.
  const [checked, setChecked] = useState(task.isCompleted);

  // APIs.
  const { mutate: updateTodoItem } = useUpdateTodo(task.id);
  const { mutate: deleteTodoItem, isPending } = useDeleteTodo(task.id);

  // Handlers.
  const onCheckChangeHandler = (details: CheckedChangeDetails) => {
    setChecked(!!details.checked);
    updateTodoItem(
      {
        isCompleted: !!details.checked,
      },
      { onSuccess: onSuccessItemUpdateOrRemove }
    );
  };

  // Handler.
  const onClickDelete = () => {
    deleteTodoItem(undefined, { onSuccess: onSuccessItemUpdateOrRemove });
  };

  // Helpers.
  const onSuccessItemUpdateOrRemove = () =>
    queryClient.invalidateQueries({
      queryKey: QueryKeys.todoList,
    });

  return (
    <List.Item>
      <Flex gap={3} align="center" w={"full"}>
        <CheckboxCard.Root
          checked={checked}
          onCheckedChange={onCheckChangeHandler}
          _checked={{ borderColor: "inherit", boxShadow: "none" }}
          transition="border-color 0.2s ease-in-out"
          cursor={"pointer"}
        >
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control display="flex" alignItems="center" gap={3}>
            {/* Checkbox Indicator - Left */}
            <CheckboxCard.Indicator
              _checked={{
                color: "white",
                borderColor: "intent.primaryActive",
                bgColor: "intent.primaryActive",
              }}
              borderRadius={"xl"}
            />

            {/* Task Description - Middle */}
            <CheckboxCard.Label
              _checked={{ textDecoration: "line-through", color: "text.muted" }}
              flex={1}
              cursor="pointer"
            >
              {task.description}
            </CheckboxCard.Label>
            <DeleteIconButton
              aria-label="Delete todo"
              onClick={onClickDelete}
              loading={isPending}
            />
          </CheckboxCard.Control>
        </CheckboxCard.Root>
      </Flex>
    </List.Item>
  );
};
