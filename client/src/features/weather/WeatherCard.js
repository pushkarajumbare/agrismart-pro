import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Cloud, 
  MapPin, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge, 
  Loader, 
  AlertCircle, 
  Compass, 
  Sunrise, 
  Sunset, 
  Sprout, 
  Calendar 
} from 'lucide-react';

const WeatherCard = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Auto-detect current location on initial mount
  useEffect(() => {
    handleUseCurrentLocation();
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLocationLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/weather/current?lat=${lat}&lon=${lon}`);
      const data = res.data?.data || res.data;
      setWeather(data.current || data);
      setForecast(data.forecast || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch weather for your location.');
      setWeather(null);
      setForecast([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied. Please search for a city manually.');
        } else {
          setError('Could not retrieve your position. Search manually below.');
        }
      },
      { timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/weather/search/${encodeURIComponent(city.trim())}`);
      const data = res.data?.data || res.data;
      setWeather(data.current || data);
      setForecast(data.forecast || []);
    } catch (err) {
      setError(err.response?.data?.message || 'City not found. Please try again.');
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Generate localized agricultural recommendations
  const getFarmingAdvice = (w) => {
    if (!w) return null;
    const { temperature, humidity, rainfall = 0 } = w;

    if (rainfall > 5) {
      return {
        title: 'High Rain Expected - Hold Irrigation',
        desc: 'Sufficient rainfall detected. Avoid running pumps or applying water-soluble fertilizers today.',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    }
    if (temperature > 35 && humidity < 40) {
      return {
        title: 'High Heat & Low Humidity - Increase Irrigation',
        desc: 'Evaporation rates are high. Schedule deep watering during early morning or evening hours to protect crop roots.',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }
    if (humidity > 80) {
      return {
        title: 'High Humidity - Monitor For Fungal Diseases',
        desc: 'Moist conditions increase the risk of fungal infections. Inspect leaf undersides and consider applying organic protective sprays.',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    }
    return {
      title: 'Favorable Field Conditions',
      desc: 'Weather parameters are in optimal range for general field maintenance, weeding, harvesting, and standard spraying.',
      badgeBg: 'bg-green-100 text-green-800 border-green-300'
    };
  };

  const advice = getFarmingAdvice(weather);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto space-y-6 my-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-100 rounded-xl">
            <Cloud size={28} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AgriSmart Weather</h2>
            <p className="text-sm text-gray-500">Real-time localized meteorological insights</p>
          </div>
        </div>

        {/* GPS Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={locationLoading || loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-60 transition-all shadow-sm text-sm"
        >
          {locationLoading ? <Loader size={18} className="animate-spin" /> : <Compass size={18} />}
          <span>Use My Location</span>
        </button>
      </div>

      {/* Manual Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Or search city manually (e.g. Pune, Nashik)"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          disabled={loading || locationLoading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || locationLoading}
          className="px-5 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors flex items-center gap-2 text-sm"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <MapPin size={18} />}
          Search
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Weather Insights Content */}
      {weather && (
        <div className="space-y-6">
          {/* Main Weather Summary Banner */}
          <div className="bg-gradient-to-br from-emerald-800 to-green-900 text-white rounded-xl p-6 shadow-md">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={22} className="text-emerald-300" />
                  <h3 className="text-2xl font-bold">{weather.city || 'Current Location'}{weather.country ? `, ${weather.country}` : ''}</h3>
                </div>
                <p className="text-6xl font-black tracking-tight my-2">
                  {Math.round(weather.temperature)}°C
                </p>
                <p className="text-emerald-200 font-medium capitalize flex items-center gap-2 text-lg">
                  {weather.description || 'Clear'}
                </p>
              </div>

              {/* Sunrise & Sunset Details */}
              <div className="grid grid-cols-2 gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-3">
                  <Sunrise size={24} className="text-amber-300" />
                  <div>
                    <p className="text-xs text-emerald-200">Sunrise</p>
                    <p className="text-sm font-bold">{weather.sunrise || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sunset size={24} className="text-orange-300" />
                  <div>
                    <p className="text-xs text-emerald-200">Sunset</p>
                    <p className="text-sm font-bold">{weather.sunset || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Droplets size={18} className="text-cyan-600" />
                <p className="text-xs font-bold text-gray-600">Humidity</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">{weather.humidity ?? 'N/A'}%</p>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Wind size={18} className="text-orange-600" />
                <p className="text-xs font-bold text-gray-600">Wind Speed</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">{weather.wind_speed ?? 'N/A'} m/s</p>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Gauge size={18} className="text-purple-600" />
                <p className="text-xs font-bold text-gray-600">Pressure</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">{weather.pressure ?? 'N/A'} hPa</p>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Eye size={18} className="text-emerald-600" />
                <p className="text-xs font-bold text-gray-600">Visibility</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {weather.visibility != null ? `${(weather.visibility / 1000).toFixed(1)} km` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Farming Advisory Card */}
          {advice && (
            <div className={`p-4 rounded-xl border ${advice.badgeBg} flex gap-3 items-start`}>
              <Sprout size={24} className="mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-base">{advice.title}</h4>
                <p className="text-sm mt-0.5 opacity-90">{advice.desc}</p>
              </div>
            </div>
          )}

          {/* 5-Day Forecast */}
          {forecast.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={20} className="text-emerald-700" />
                <h3 className="font-bold text-gray-800 text-lg">5-Day Weather Forecast</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {forecast.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">{item.date}</p>
                    <p className="text-xl font-extrabold text-emerald-800">{Math.round(item.temp)}°C</p>
                    <p className="text-xs text-gray-600 capitalize mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;