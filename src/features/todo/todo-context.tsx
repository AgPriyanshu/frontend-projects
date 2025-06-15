import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import { todoApi, type Task, ApiError } from "../../api";

interface TodoContextType {
  todos: Task[];
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const tasks = await todoApi.getTasks();
      setTodos(tasks);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (text: string) => {
    try {
      setError(null);
      const newTask = await todoApi.createTask(text);
      setTodos((prev) => [...prev, newTask]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to add todo");
      }
      console.error(err);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      setError(null);
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const updatedTask = await todoApi.updateTask(id, {
        completed: !todo.completed,
      });
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTask : todo))
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update todo");
      }
      console.error(err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      await todoApi.deleteTask(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete todo");
      }
      console.error(err);
    }
  };

  return (
    <TodoContext.Provider
      value={{ todos, addTodo, toggleTodo, deleteTodo, isLoading, error }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
};
