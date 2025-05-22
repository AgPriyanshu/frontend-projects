import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { fetchWeatherData } from './api';
import { WeatherData } from './types';

export const WeatherApp: React.FC = () => {
  const [city, setCity] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!apiKey) {
      setError('Please enter your OpenWeatherMap API key.');
      return;
    }
    if (!city) {
      setError('Please enter a city name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWeather(null); // Clear previous weather data

    try {
      const data = await fetchWeatherData(city, apiKey);
      setWeather(data);
      setError(null); // Clear any previous error
    } catch (err) {
      setWeather(null); // Clear weather data on error
      setError('Could not fetch weather data. Please check the city and API key, or try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-card text-card-foreground w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-6">Weather App</h2>

      <div className="mb-4">
        <label htmlFor="apiKey" className="block text-sm font-medium mb-1 text-muted-foreground">
          API Key (OpenWeatherMap)
        </label>
        <Input
          id="apiKey"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenWeatherMap API Key"
          className="bg-input border-border placeholder:text-muted-foreground/50"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Note: API keys should ideally be handled via environment variables on a server.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="flex-grow bg-input border-border placeholder:text-muted-foreground/50"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {isLoading && (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="mt-4 p-3 border border-destructive/50 bg-destructive/10 rounded-md text-destructive text-sm">
          <p>{error}</p>
        </div>
      )}

      {weather && !isLoading && (
        <div className="mt-6 p-4 border border-border rounded-lg bg-background/50">
          <h3 className="text-xl font-semibold text-center mb-2">{weather.name}</h3>
          <div className="flex items-center justify-center">
            <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-20 h-20"
            />
          </div>
          <p className="text-4xl font-bold text-center mt-1 mb-2">{weather.main.temp.toFixed(1)}°C</p>
          <p className="text-center capitalize text-muted-foreground mb-4">{weather.weather[0].description}</p>
          
          <div className="grid grid-cols-3 gap-2 text-sm text-center border-t border-border pt-3 mt-3">
            <div>
              <p className="font-medium">Feels like</p>
              <p className="text-muted-foreground">{weather.main.feels_like.toFixed(1)}°C</p>
            </div>
            <div>
              <p className="font-medium">Humidity</p>
              <p className="text-muted-foreground">{weather.main.humidity}%</p>
            </div>
            <div>
              <p className="font-medium">Wind</p>
              <p className="text-muted-foreground">{weather.wind.speed.toFixed(1)} m/s</p>
            </div>
          </div>
        </div>
      )}
       {!weather && !error && !isLoading && (
        <div className="mt-6 p-4 border border-dashed border-border rounded-lg bg-background/30 text-center">
          <p className="text-muted-foreground">Enter a city and API key to see the weather.</p>
        </div>
      )}
    </div>
  );
};
