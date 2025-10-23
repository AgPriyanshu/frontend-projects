import { createFileRoute } from "@tanstack/react-router";
import { TodoCard } from "@/features/todo/todo-card";
import { MapCard } from "@/features/web-gis/map-card";
import { GadgetClassifierCard } from "@/features/device-classifier";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome to the World of Apps
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TodoCard />
          <MapCard />
          <GadgetClassifierCard />
        </div>
      </div>
    </div>
  );
}
