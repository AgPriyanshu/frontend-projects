import axios from 'axios';
import { WeatherData } from './types';

const OPENWEATHERMAP_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeatherData = async (city: string, apiKey: string): Promise<WeatherData> => {
  try {
    const response = await axios.get<WeatherData>(OPENWEATHERMAP_API_URL, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log specific error details if available
      console.error(`Axios error fetching weather data for ${city}:`, error.response?.data || error.message);
    } else {
      console.error(`Unexpected error fetching weather data for ${city}:`, error);
    }
    // Re-throw the error to be handled by the caller
    throw error;
  }
};
