import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { 
  Sprout, 
  AlertCircle, 
  Loader, 
  TrendingUp, 
  Calendar, 
  Droplets, 
  Award, 
  DollarSign, 
  RotateCcw 
} from 'lucide-react';

const DEFAULT_FORM_STATE = {
  nitrogen: '60',
  phosphorus: '40',
  potassium: '50',
  ph: '7',
  temperature: '25',
  humidity: '65',
  rainfall: '600',
  moisture: '50'
};



const CropAdvisor = () => {
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_STATE);
    setRecommendation(null);
    setError(null);
  };

  const parseInput = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getRecommendations = async () => {
    setError(null);
    setRecommendation(null);
    setLoading(true);

    const payload = {
      nitrogen: parseInput(formData.nitrogen),
      phosphorus: parseInput(formData.phosphorus),
      potassium: parseInput(formData.potassium),
      ph: parseInput(formData.ph),
      temperature: parseInput(formData.temperature),
      humidity: parseInput(formData.humidity),
      rainfall: parseInput(formData.rainfall),
      moisture: parseInput(formData.moisture)
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/crop/recommend`, payload);
      const data = response.data?.data || response.data?.recommendation || response.data;
      setRecommendation(data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to analyze farm parameters. Please verify your server connection.';
      setError(errorMsg);
      console.error('Crop recommendation API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderAlternativeName = (cropItem) => {
    if (typeof cropItem === 'string') return cropItem;
    if (typeof cropItem === 'object' && cropItem !== null) {
      return cropItem.crop || cropItem.name || 'Alternative Crop';
    }
    return 'Alternative Crop';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto my-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Sprout size={28} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Crop Recommendation Engine</h2>
            <p className="text-sm text-gray-500">AI-driven agricultural recommendations based on soil N-P-K & local weather</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          title="Reset to default values"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Input Form Section */}
      <div className="bg-gray-50/80 rounded-xl p-6 mb-6 border border-gray-200/60">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> Environmental & Soil Metrics
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nitrogen (N) - mg/kg</label>
            <input
              type="number"
              name="nitrogen"
              min="0"
              max="500"
              value={formData.nitrogen}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phosphorus (P) - mg/kg</label>
            <input
              type="number"
              name="phosphorus"
              min="0"
              max="500"
              value={formData.phosphorus}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Potassium (K) - mg/kg</label>
            <input
              type="number"
              name="potassium"
              min="0"
              max="500"
              value={formData.potassium}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Soil pH Level (0.0 - 14.0)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="14"
              name="ph"
              value={formData.ph}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Average Temperature (°C)</label>
            <input
              type="number"
              name="temperature"
              min="-10"
              max="60"
              value={formData.temperature}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Relative Humidity (%)</label>
            <input
              type="number"
              name="humidity"
              min="0"
              max="100"
              value={formData.humidity}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Rainfall (mm)</label>
            <input
              type="number"
              name="rainfall"
              min="0"
              max="3000"
              value={formData.rainfall}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Soil Moisture Content (%)</label>
            <input
              type="number"
              name="moisture"
              min="0"
              max="100"
              value={formData.moisture}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
            />
          </div>
        </div>

        <button
          onClick={getRecommendations}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Analyzing Field Data...</span>
            </>
          ) : (
            <>
              <TrendingUp size={18} />
              <span>Get AI Recommendation</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3 mb-6 items-center">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Recommendation Display */}
      {recommendation && (
        <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl p-6 border border-green-200/80 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>🌾</span> Crop Suitability Report
          </h3>

          <div className="p-6 bg-white rounded-xl border-l-4 border-green-600 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  Top Recommended Crop
                </span>
                <h4 className="text-3xl font-extrabold text-green-800 capitalize">
                  {recommendation.best_crop || recommendation.crop || 'Optimal Crop Selection'}
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  Highest statistical match based on your local nutrient density (N-P-K), pH, and climate variables.
                </p>
              </div>

              {(recommendation.suitability_score != null || recommendation.confidence != null) && (
                <div className="sm:text-right bg-green-50 p-3 rounded-lg border border-green-100 flex-shrink-0">
                  <p className="text-xs font-bold text-gray-500 uppercase">Match Confidence</p>
                  <p className="text-3xl font-black text-green-700 mt-0.5">
                    {recommendation.suitability_score ?? recommendation.confidence}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alternatives */}
          {recommendation.top_5_alternatives && recommendation.top_5_alternatives.length > 0 && (
            <div>
              <p className="font-bold text-gray-800 text-sm mb-3">Alternative Suitable Choices</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {recommendation.top_5_alternatives.map((cropItem, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-green-200/60 shadow-xs flex items-center gap-2"
                  >
                    <span className="text-xs font-bold text-green-700 bg-green-100 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                      {idx + 2}
                    </span>
                    <p className="font-semibold text-gray-800 capitalize text-sm">
                      {renderAlternativeName(cropItem)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-xs">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Calendar size={18} />
                <p className="font-bold text-xs">Growing Duration</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {recommendation.growing_duration || '3 - 4 Months (Seasonal)'}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-cyan-100 shadow-xs">
              <div className="flex items-center gap-2 text-cyan-700 mb-1">
                <Droplets size={18} />
                <p className="font-bold text-xs">Water Requirement</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {recommendation.water_requirement || 'Moderate (450-650 mm)'}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-xs">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <Award size={18} />
                <p className="font-bold text-xs">Expected Yield</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {recommendation.expected_yield || 'High yield potential under optimal care'}
              </p>
            </div>
          </div>

          {/* Market Profitability */}
          {recommendation.market_profitability && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex gap-3 items-start">
              <DollarSign size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Market & Economic Outlook</p>
                <p className="text-sm text-amber-800 mt-0.5">{recommendation.market_profitability}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropAdvisor;