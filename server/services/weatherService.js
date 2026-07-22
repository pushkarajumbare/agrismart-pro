/**
 * Weather Service
 * Integrates with OpenWeather API
 */

const axios = require('axios');
const Logger = require('../utils/logger');

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const WeatherService = {
  /**
   * Get current weather by coordinates (GPS)
   */
  getWeatherByCoordinates: async (lat, lon) => {
    try {
      if (!WEATHER_API_KEY) {
        throw new Error('OpenWeather API key not configured');
      }

      Logger.info(`Fetching weather data for coordinates: lat=${lat}, lon=${lon}`);

      const response = await axios.get(
        `${WEATHER_BASE_URL}/weather`,
        {
          params: {
            lat,
            lon,
            units: 'metric',
            appid: WEATHER_API_KEY
          },
          timeout: 10000
        }
      );

      Logger.success(`Weather data received for coordinates: lat=${lat}, lon=${lon}`);
      return response.data;
    } catch (error) {
      Logger.error('Weather API error (Coordinates)', error.message);

      throw {
        statusCode: 503,
        message: 'Weather service unavailable',
        details: error.message
      };
    }
  },

  /**
   * Get 5-day forecast by coordinates (GPS)
   */
  getWeatherForecastByCoordinates: async (lat, lon) => {
    try {
      if (!WEATHER_API_KEY) {
        throw new Error('OpenWeather API key not configured');
      }

      Logger.info(`Fetching forecast for coordinates: lat=${lat}, lon=${lon}`);

      const response = await axios.get(
        `${WEATHER_BASE_URL}/forecast`,
        {
          params: {
            lat,
            lon,
            units: 'metric',
            appid: WEATHER_API_KEY
          },
          timeout: 10000
        }
      );

      Logger.success(`Weather forecast received for coordinates: lat=${lat}, lon=${lon}`);

      // Process 3-hour entries into clean daily summaries
      const dailyMap = {};
      response.data.list.forEach((entry) => {
        const dateStr = entry.dt_txt.split(' ')[0];
        if (!dailyMap[dateStr] || entry.dt_txt.includes('12:00:00')) {
          dailyMap[dateStr] = {
            date: new Date(entry.dt * 1000).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            }),
            temp: entry.main.temp,
            description: entry.weather[0]?.description || '',
            humidity: entry.main.humidity
          };
        }
      });

      return Object.values(dailyMap).slice(0, 5);
    } catch (error) {
      Logger.error('Weather forecast error (Coordinates)', error.message);

      throw {
        statusCode: 503,
        message: 'Weather forecast service unavailable',
        details: error.message
      };
    }
  },

  /**
   * Get current weather for a city
   */
  getWeatherByCity: async (city) => {
    try {
      if (!WEATHER_API_KEY) {
        throw new Error('OpenWeather API key not configured');
      }

      Logger.info(`Fetching weather data for city: ${city}`);
      
      const response = await axios.get(
        `${WEATHER_BASE_URL}/weather`,
        {
          params: {
            q: city,
            units: 'metric',
            appid: WEATHER_API_KEY
          },
          timeout: 10000
        }
      );

      Logger.success(`Weather data received for ${city}`);
      return response.data;
    } catch (error) {
      Logger.error('Weather API error', error.message);
      
      if (error.response?.status === 404) {
        throw {
          statusCode: 404,
          message: 'City not found',
          details: `Weather data not available for "${city}"`
        };
      }
      
      throw {
        statusCode: 503,
        message: 'Weather service unavailable',
        details: error.message
      };
    }
  },

  /**
   * Get weather forecast for a city
   */
  getWeatherForecast: async (city, days = 5) => {
    try {
      Logger.info(`Fetching ${days}-day forecast for city: ${city}`);
      
      // Get coordinates first
      const weatherData = await WeatherService.getWeatherByCity(city);
      const { lat, lon } = weatherData.coord;

      // Delegate to coordinate forecast lookup
      return await WeatherService.getWeatherForecastByCoordinates(lat, lon);
    } catch (error) {
      Logger.error('Weather forecast error', error.message);
      throw {
        statusCode: error.statusCode || 503,
        message: error.message || 'Weather forecast service unavailable',
        details: error.details || error.message
      };
    }
  },

  /**
   * Format weather data for farming advice
   */
  formatWeatherForAdvice: (weatherData) => {
    const main = weatherData.main || {};
    const wind = weatherData.wind || {};
    const clouds = weatherData.clouds || {};
    const rain = weatherData.rain || {};

    return {
      temperature: main.temp,
      feels_like: main.feels_like,
      humidity: main.humidity,
      pressure: main.pressure,
      wind_speed: wind.speed,
      wind_direction: wind.deg,
      cloudiness: clouds.all,
      rainfall: rain['1h'] || 0,
      description: weatherData.weather?.[0]?.description || 'Unknown',
      sunrise: weatherData.sys?.sunrise,
      sunset: weatherData.sys?.sunset,
      visibility: weatherData.visibility
    };
  }
};

module.exports = WeatherService;