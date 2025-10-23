import { createFileRoute } from "@tanstack/react-router";
import { TodoList } from "@/features/todo/todo-list";
import { TodoProvider } from "@/features/todo/todo-context";

export const Route = createFileRoute("/todo-list")({
  component: TodoListPage,
});

function TodoListPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Todo List</h1>
        <TodoProvider>
          <TodoList />
        </TodoProvider>
      </div>
    </div>
  );
}
