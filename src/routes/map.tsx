import { createFileRoute } from "@tanstack/react-router";
import { Map } from "@/features/map/map";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Interactive Map</h1>
      <div className="flex-1">
        <Map />
      </div>
    </div>
  );
}
