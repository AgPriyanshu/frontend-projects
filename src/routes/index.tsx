import { createFileRoute } from "@tanstack/react-router";
import { TodoCard } from "@/features/todo/todo-card";
import { WeatherCard } from "../features/weather/weather-card";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="flex gap-4 p-4">
      <TodoCard />
      <WeatherCard />
    </div>
  ),
});
