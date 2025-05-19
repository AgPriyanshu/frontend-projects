import { createFileRoute } from "@tanstack/react-router";
import { TodoCard } from "@/features/todo/todo-card";

export const Route = createFileRoute("/")({
  component: () => <TodoCard />,
});
