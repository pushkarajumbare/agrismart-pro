import React, { useState } from 'react';
import axios from 'axios';
import { Sprout, AlertCircle, Loader, TrendingUp } from 'lucide-react';

const CropAdvisor = () => {
  const [formData, setFormData] = useState({
    nitrogen: '60',
    phosphorus: '40',
    potassium: '50',
    ph: '7',
    temperature: '25',
    humidity: '65',
    rainfall: '600',
    moisture: '50'
  });

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getRecommendations = async () => {
    setError(null);
    setLoading(true);
try {
      setLoading(true);
      setError(null);

      // Dynamic base URL for live backend (Render) with process fallback
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://agrismart-pro-3.onrender.com';

      const response = await axios.post(`${API_BASE_URL}/api/crop/recommend`, {
        nitrogen: parseFloat(formData.nitrogen) || 0,
        phosphorus: parseFloat(formData.phosphorus) || 0,
        potassium: parseFloat(formData.potassium) || 0,
        ph: parseFloat(formData.ph) || 7.0,
        temperature: parseFloat(formData.temperature) || 25.0,
        humidity: parseFloat(formData.humidity) || 60.0,
        rainfall: parseFloat(formData.rainfall) || 100.0,
        moisture: parseFloat(formData.moisture) || 50.0
      });

      setRecommendation(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
      console.error('Crop recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Sprout size={24} className="text-green-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Crop Recommendation</h2>
          <p className="text-sm text-gray-600">Get AI-powered crop suggestions based on your soil and weather</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Enter Soil & Weather Data</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                {key === 'nitrogen' && 'Nitrogen (N)'}
                {key === 'phosphorus' && 'Phosphorus (P)'}
                {key === 'potassium' && 'Potassium (K)'}
                {key === 'ph' && 'pH Level'}
                {key === 'temperature' && 'Temperature (°C)'}
                {key === 'humidity' && 'Humidity (%)'}
                {key === 'rainfall' && 'Rainfall (mm)'}
                {key === 'moisture' && 'Soil Moisture (%)'}
              </label>
              <input
                type="number"
                name={key}
                value={value}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          ))}
        </div>

        <button
          onClick={getRecommendations}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp size={20} />
              Get Recommendations
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex gap-3 mb-6">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {recommendation && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">🌾 Recommended Crops</h3>

          {/* Best Crop */}
          <div className="mb-6 p-6 bg-white rounded-lg border-l-4 border-green-600 shadow-md">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">BEST CHOICE</p>
                <h4 className="text-3xl font-bold text-green-700 mt-2">{recommendation.best_crop}</h4>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600">SUITABILITY</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{recommendation.suitability_score}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {recommendation.best_crop} is the optimal crop for your soil and environmental conditions
            </p>
          </div>

          {/* Alternative Crops */}
          {recommendation.top_5_alternatives && (
            <div className="mb-6">
              <p className="font-semibold text-gray-800 mb-3">Alternative Options</p>
              <div className="space-y-2">
                {recommendation.top_5_alternatives.map((crop, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border-l-4 border-green-400">
                    <p className="font-semibold text-gray-800">{idx + 2}. {crop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
            {recommendation.growing_duration && (
              <div className="p-3 bg-white rounded border-l-4 border-blue-400">
                <p className="font-semibold text-gray-700">📅 Duration</p>
                <p className="text-gray-600 mt-1">{recommendation.growing_duration}</p>
              </div>
            )}
            {recommendation.water_requirement && (
              <div className="p-3 bg-white rounded border-l-4 border-cyan-400">
                <p className="font-semibold text-gray-700">💧 Water</p>
                <p className="text-gray-600 mt-1">{recommendation.water_requirement}</p>
              </div>
            )}
            {recommendation.expected_yield && (
              <div className="p-3 bg-white rounded border-l-4 border-yellow-400">
                <p className="font-semibold text-gray-700">🌾 Expected Yield</p>
                <p className="text-gray-600 mt-1">{recommendation.expected_yield}</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {recommendation.market_profitability && (
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="font-semibold text-gray-800 mb-1">💰 Market Profitability</p>
              <p className="text-sm text-gray-700">{recommendation.market_profitability}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropAdvisor;
