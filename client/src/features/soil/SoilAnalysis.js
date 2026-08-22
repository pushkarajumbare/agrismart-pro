import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { Sprout, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';



const SoilAnalysisForm = () => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const parseNumber = (val, fallback = undefined) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null); // Clear previous results while analyzing new data

    // Validate required fields
    const requiredFields = ['nitrogen', 'phosphorus', 'potassium', 'ph'];
    const missing = requiredFields.some(
      (field) => !formData[field].toString().trim()
    );

    if (missing) {
      setError('Please fill in all required fields (N, P, K, pH)');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nitrogen: parseNumber(formData.nitrogen),
        phosphorus: parseNumber(formData.phosphorus),
        potassium: parseNumber(formData.potassium),
        ph: parseNumber(formData.ph),
        temperature: parseNumber(formData.temperature, 25),
        humidity: parseNumber(formData.humidity, 65),
        rainfall: parseNumber(formData.rainfall, 600),
        moisture: parseNumber(formData.moisture, 50)
      };

      const response = await axios.post(`${API_BASE_URL}/api/soil/analyze`, payload);
      setResult(response.data?.data || response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to connect to the analysis server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-3 bg-green-100 text-green-700 rounded-lg">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Soil Analysis & Crop Advisor</h2>
          <p className="text-sm text-gray-500">Input soil metrics to receive tailored crop recommendations.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-3">Primary Soil Nutrients <span className="text-red-500">*</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nitrogen (N)</label>
              <input
                type="number"
                name="nitrogen"
                step="any"
                min="0"
                placeholder="0-140"
                value={formData.nitrogen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phosphorus (P)</label>
              <input
                type="number"
                name="phosphorus"
                step="any"
                min="0"
                placeholder="0-145"
                value={formData.phosphorus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Potassium (K)</label>
              <input
                type="number"
                name="potassium"
                step="any"
                min="0"
                placeholder="0-205"
                value={formData.potassium}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">pH Level</label>
              <input
                type="number"
                name="ph"
                step="0.1"
                min="0"
                max="14"
                placeholder="0-14"
                value={formData.ph}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-3">Environmental Factors <span className="text-xs text-gray-400 font-normal">(Optional — system defaults apply)</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Temperature (°C)</label>
              <input
                type="number"
                name="temperature"
                step="any"
                placeholder="25"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Humidity (%)</label>
              <input
                type="number"
                name="humidity"
                step="any"
                placeholder="65"
                value={formData.humidity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rainfall (mm)</label>
              <input
                type="number"
                name="rainfall"
                step="any"
                placeholder="600"
                value={formData.rainfall}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Moisture (%)</label>
              <input
                type="number"
                name="moisture"
                step="any"
                placeholder="50"
                value={formData.moisture}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Soil Data...
            </>
          ) : (
            'Analyze Soil & Recommend Crops'
          )}
        </button>
      </form>

      {/* Results Display */}
      {result && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-green-800 font-semibold text-lg">
            <CheckCircle2 className="w-5 h-5" />
            Analysis Complete
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendedCrop && (
              <div className="p-4 bg-white rounded-md border border-green-100 shadow-sm">
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Recommended Crop</span>
                <span className="text-xl font-bold text-green-700">{result.recommendedCrop}</span>
              </div>
            )}
            
            {result.confidenceScore && (
              <div className="p-4 bg-white rounded-md border border-green-100 shadow-sm">
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Confidence Score</span>
                <span className="text-xl font-bold text-green-700">{result.confidenceScore}%</span>
              </div>
            )}
          </div>

          {result.suggestions && (
            <div className="p-4 bg-white rounded-md border border-green-100 shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Soil Health Suggestions</span>
              <p className="text-sm text-gray-700 leading-relaxed">{result.suggestions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SoilAnalysisForm;