import { useState } from "react";
import { useTodo } from "./todo-context";

export const TodoList = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodo();
  const [newTodo, setNewTodo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-4 p-4 bg-card text-card-foreground rounded-lg border border-border"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
            />
            <span
              className={`flex-1 ${
                todo.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
