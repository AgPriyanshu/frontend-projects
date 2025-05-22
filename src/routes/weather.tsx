import { createFileRoute } from "@tanstack/react-router";
import { WeatherApp } from "../features/weather/weather-app";

export const Route = createFileRoute("/weather")({
  component: () => (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Weather App</h1>
        <WeatherApp />
      </div>
    </div>
  ),
});
