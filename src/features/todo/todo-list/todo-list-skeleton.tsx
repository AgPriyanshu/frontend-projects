import { HStack, Skeleton } from "@chakra-ui/react";

const TodoListItemSkeleton = () => {
  return (
    <HStack flex="1" gap={"3"} width={"full"}>
      <Skeleton
        height="54px"
        flex="1"
        bgColor={"surface.subtle"}
        borderRadius={"lg"}
      />
      <Skeleton
        height="36px"
        w="36px"
        borderRadius={"lg"}
        bgColor={"surface.subtle"}
      />
    </HStack>
  );
};

export const TodoListSkeleton = () => {
  return Array(20)
    .fill(0)
    .map((_, index) => (
      <TodoListItemSkeleton key={"todoListSkeleton-" + index} />
    ));
};
