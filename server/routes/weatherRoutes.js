/**
 * Weather Routes
 */

const express = require('express');
const WeatherController = require('../controllers/weatherController');

const router = express.Router();

// Routes
router.get('/current', WeatherController.getCurrentLocationWeather); // 📍 Added GPS route
router.get('/search/:city', WeatherController.searchCity);
router.get('/forecast/:city', WeatherController.getForecast);
router.post('/farming-advice', WeatherController.getFarmingAdvice);

module.exports = router;