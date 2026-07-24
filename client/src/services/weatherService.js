import axios from 'axios';

// Uses REACT_APP_API_URL in production or defaults to local Flask/Node backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WEATHER_API_URL = `${API_BASE_URL}/api/weather`;

/**
 * Fetch weather data by city name
 * @param {string} city - The city name (e.g. "Pune", "Nashik")
 * @returns {Promise<Object>} Weather and forecast response
 */
export const getWeatherData = async (city) => {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/search/${encodeURIComponent(city.trim())}`);
    return response.data;
  } catch (error) {
    // Re-throw response message or default fallback for component error handling
    const errorMessage = error.response?.data?.message || 'City not found or server error.';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch weather data by geographic coordinates (GPS)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather and forecast response
 */
export const getWeatherDataByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/current?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Unable to retrieve location weather.';
    throw new Error(errorMessage);
  }
};