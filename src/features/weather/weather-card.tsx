import { Link } from "@tanstack/react-router";

export const WeatherCard = () => {
  return (
    <Link
      to="/weather"
      className="block p-6 bg-card text-card-foreground rounded-lg border border-border hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <span className="text-2xl">☁️</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Weather App</h2>
          <p className="text-muted-foreground">
            Check the current weather
          </p>
        </div>
      </div>
    </Link>
  );
};
