/**
 * Weather Controller
 * Handles weather data and farming advice
 */

const WeatherService = require('../services/weatherService');
const AiService = require('../services/aiService');
const InputValidator = require('../validators/inputValidator');
const ResponseHandler = require('../utils/response');
const Logger = require('../utils/logger');

const WeatherController = {
  /**
   * GET /api/weather/current?lat=...&lon=...
   * Get weather data by geographic coordinates (GPS)
   */
  getCurrentLocationWeather: async (req, res, next) => {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return ResponseHandler.sendError(res, 'Latitude and longitude are required', 400);
      }

      Logger.info(`Fetching weather for coordinates: lat=${lat}, lon=${lon}`);

      // Fetch current weather & forecast in parallel via service
      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getWeatherByCoordinates(lat, lon),
        WeatherService.getWeatherForecastByCoordinates(lat, lon)
      ]);

      const response = {
        current: {
          city: weatherData.name,
          country: weatherData.sys.country,
          temperature: weatherData.main.temp,
          feels_like: weatherData.main.feels_like,
          humidity: weatherData.main.humidity,
          wind_speed: weatherData.wind.speed,
          rainfall: weatherData.rain?.['1h'] || weatherData.rain?.['3h'] || 0,
          pressure: weatherData.main.pressure,
          cloudiness: weatherData.clouds.all,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          visibility: weatherData.visibility,
          sunrise: weatherData.sys.sunrise,
          sunset: weatherData.sys.sunset,
          timestamp: new Date().toISOString()
        },
        forecast: forecastData
      };

      ResponseHandler.send(res, response, 'Current location weather retrieved successfully', 200);
    } catch (error) {
      Logger.error('Current location weather error', error.message);

      if (error.statusCode) {
        return ResponseHandler.sendError(res, error.message, error.statusCode);
      }

      ResponseHandler.sendError(res, 'Failed to retrieve location weather', 500);
    }
  },

  /**
   * GET /api/weather/search/:city
   * Get weather data for a city
   */
  searchCity: async (req, res, next) => {
    try {
      const { city } = req.params;

      const validation = InputValidator.validateWeatherCity(city);
      if (!validation.valid) {
        return ResponseHandler.sendError(res, validation.error, 400);
      }

      Logger.info(`Searching weather for city: ${city}`);

      // Fetch both current weather and forecast for city search
      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getWeatherByCity(city),
        WeatherService.getWeatherForecast(city)
      ]);

      const response = {
        current: {
          city: weatherData.name,
          country: weatherData.sys.country,
          temperature: weatherData.main.temp,
          feels_like: weatherData.main.feels_like,
          humidity: weatherData.main.humidity,
          wind_speed: weatherData.wind.speed,
          rainfall: weatherData.rain?.['1h'] || weatherData.rain?.['3h'] || 0,
          pressure: weatherData.main.pressure,
          cloudiness: weatherData.clouds.all,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          visibility: weatherData.visibility,
          sunrise: weatherData.sys.sunrise,
          sunset: weatherData.sys.sunset,
          timestamp: new Date().toISOString()
        },
        forecast: forecastData
      };

      ResponseHandler.send(res, response, 'Weather data retrieved successfully', 200);
    } catch (error) {
      Logger.error('Weather search error', error.message);

      if (error.statusCode) {
        return ResponseHandler.sendError(res, error.message, error.statusCode);
      }

      ResponseHandler.sendError(res, 'Weather search failed', 500);
    }
  },

  /**
   * GET /api/weather/forecast/:city
   * Get weather forecast for a city
   */
  getForecast: async (req, res, next) => {
    try {
      const { city } = req.params;

      const validation = InputValidator.validateWeatherCity(city);
      if (!validation.valid) {
        return ResponseHandler.sendError(res, validation.error, 400);
      }

      Logger.info(`Getting forecast for city: ${city}`);

      const forecastData = await WeatherService.getWeatherForecast(city);

      ResponseHandler.send(res, forecastData, 'Forecast retrieved successfully', 200);
    } catch (error) {
      Logger.error('Forecast error', error.message);

      if (error.statusCode) {
        return ResponseHandler.sendError(res, error.message, error.statusCode);
      }

      ResponseHandler.sendError(res, 'Forecast retrieval failed', 500);
    }
  },

  /**
   * POST /api/weather/farming-advice
   * Get AI farming advice based on weather
   */
  getFarmingAdvice: async (req, res, next) => {
    try {
      const { city, crop } = req.body;

      if (!city || !crop) {
        return ResponseHandler.sendError(res, 'City and crop are required', 400);
      }

      Logger.info(`Getting farming advice for ${crop} in ${city}`);

      const weatherData = await WeatherService.getWeatherByCity(city);
      const formattedWeather = WeatherService.formatWeatherForAdvice(weatherData);

      const advice = await AiService.getAiFarmingAdvice({
        crop,
        weather: formattedWeather
      });

      ResponseHandler.send(res, advice, 'Farming advice generated', 200);
    } catch (error) {
      Logger.error('Farming advice error', error.message);

      if (error.statusCode) {
        return ResponseHandler.sendError(res, error.message, error.statusCode);
      }

      ResponseHandler.sendError(res, 'Farming advice generation failed', 500);
    }
  }
};

module.exports = WeatherController;