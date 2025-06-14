import { createFileRoute } from "@tanstack/react-router";
import { TodoCard } from "@/features/todo/todo-card";
import { MapCard } from "@/features/map/map-card";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to Apps</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodoCard />
          <MapCard />
        </div>
      </div>
    </div>
  ),
});
