import React, { useState } from 'react';
import axios from 'axios';
import { Beaker, AlertCircle, Loader, TrendingUp } from 'lucide-react';

const SoilAnalysis = () => {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    temperature: '',
    humidity: '',
    rainfall: '',
    moisture: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.nitrogen || !formData.phosphorus || !formData.potassium || !formData.ph) {
      setError('Please fill in all required fields (N, P, K, pH)');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/soil/analyze', {
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        ph: parseFloat(formData.ph),
        temperature: parseFloat(formData.temperature) || 25,
        humidity: parseFloat(formData.humidity) || 65,
        rainfall: parseFloat(formData.rainfall) || 600,
        moisture: parseFloat(formData.moisture) || 50
      });

      setResult(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing soil. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Beaker size={24} className="text-green-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Soil Analysis</h2>
          <p className="text-sm text-gray-600">Enter soil properties for crop recommendations</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-6">
        {/* NPK Inputs */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nitrogen (N) mg/kg *</label>
          <input
            type="number"
            name="nitrogen"
            placeholder="0-200"
            value={formData.nitrogen}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phosphorus (P) mg/kg *</label>
          <input
            type="number"
            name="phosphorus"
            placeholder="0-200"
            value={formData.phosphorus}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Potassium (K) mg/kg *</label>
          <input
            type="number"
            name="potassium"
            placeholder="0-200"
            value={formData.potassium}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">pH Level *</label>
          <input
            type="number"
            name="ph"
            step="0.1"
            placeholder="0-14"
            value={formData.ph}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Optional Weather Inputs */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature (°C)</label>
          <input
            type="number"
            name="temperature"
            placeholder="0-50"
            value={formData.temperature}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Humidity (%)</label>
          <input
            type="number"
            name="humidity"
            placeholder="0-100"
            value={formData.humidity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rainfall (mm)</label>
          <input
            type="number"
            name="rainfall"
            placeholder="0-2000"
            value={formData.rainfall}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Soil Moisture (%)</label>
          <input
            type="number"
            name="moisture"
            placeholder="0-100"
            value={formData.moisture}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing Soil...
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                Analyze Soil
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex gap-3 mb-6">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-green-700" />
            Analysis Results
          </h3>

          {/* Recommended Crop */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-white rounded-lg border-l-4 border-green-500">
              <p className="text-xs font-semibold text-gray-600 uppercase">Recommended Crop</p>
              <p className="text-2xl font-bold text-green-700 mt-2">{result.recommended_crop}</p>
              <p className="text-sm text-gray-600 mt-2">Best choice for your soil</p>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
              <p className="text-xs font-semibold text-gray-600 uppercase">Soil Health Score</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{Math.round(result.soil_health_score || 0)}/100</p>
              <p className="text-sm text-gray-600 mt-2">Overall soil condition</p>
            </div>
          </div>

          {/* Alternative Crops */}
          {result.alternative_crops && result.alternative_crops.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">Top Alternative Crops</p>
              <div className="flex flex-wrap gap-2">
                {result.alternative_crops.map((crop, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deficiencies */}
          {result.nutrient_deficiencies && result.nutrient_deficiencies.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">⚠️ Nutrient Deficiencies</p>
              <ul className="space-y-2">
                {result.nutrient_deficiencies.map((def, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{def}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {result.water_requirement && (
              <div className="p-3 bg-white rounded border-l-4 border-cyan-400">
                <p className="font-semibold text-gray-700">💧 Water Requirement</p>
                <p className="text-gray-600 mt-1">{result.water_requirement}</p>
              </div>
            )}
            {result.expected_yield && (
              <div className="p-3 bg-white rounded border-l-4 border-orange-400">
                <p className="font-semibold text-gray-700">🌾 Expected Yield</p>
                <p className="text-gray-600 mt-1">{result.expected_yield}</p>
              </div>
            )}
            {result.season_recommendation && (
              <div className="p-3 bg-white rounded border-l-4 border-purple-400">
                <p className="font-semibold text-gray-700">📅 Season</p>
                <p className="text-gray-600 mt-1">{result.season_recommendation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilAnalysis;