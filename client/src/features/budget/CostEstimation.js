import React, { useState } from 'react';
import axios from 'axios';
import { DollarSign, AlertCircle, Loader, BarChart3 } from 'lucide-react';

const CostEstimation = () => {
  const [formData, setFormData] = useState({
    crop: 'Rice',
    area_hectares: '1',
    expected_yield_per_hectare: '50',
    market_price_per_unit: '2000'
  });

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCost = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/cost/estimate",
        {
          crop: formData.crop,
          area_hectares: parseFloat(formData.area_hectares),
          expected_yield_per_hectare: parseFloat(formData.expected_yield_per_hectare),
          market_price_per_unit: parseFloat(formData.market_price_per_unit)
        }
      );
      console.log("Cost API Response:", response.data);
      setEstimate(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate costs');
    } finally {
      setLoading(false);
    }
  };

  // Helper values to handle both snake_case and camelCase backend formats smoothly
  const totalInvestment = estimate?.total_cost ?? estimate?.totalInvestment;
  const expectedRevenue = estimate?.expected_income ?? estimate?.expectedRevenue;
  const netProfit = estimate?.profit ?? estimate?.netProfit;
  const roi = estimate?.roi ?? estimate?.ROI ?? estimate?.rOI;
  const profitMargin = estimate?.profit_margin ?? estimate?.profitMargin;
  const breakEvenYield = estimate?.break_even_yield ?? estimate?.breakEvenYield;
  const riskLevel = estimate?.risk_level ?? estimate?.riskLevel;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <DollarSign size={24} className="text-yellow-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cost Estimation & ROI</h2>
          <p className="text-sm text-gray-600">Calculate farming costs, profit and return on investment</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Enter Farm Details</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Type</label>
            <select 
              name="crop" 
              value={formData.crop} 
              onChange={handleChange} 
              className="input-field"
            >
              <option>Rice</option>
              <option>Wheat</option>
              <option>Maize</option>
              <option>Cotton</option>
              <option>Sugarcane</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Farm Area (hectares)</label>
            <input 
              type="number" 
              name="area_hectares" 
              value={formData.area_hectares} 
              onChange={handleChange} 
              className="input-field" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Yield (units/ha)</label>
            <input 
              type="number" 
              name="expected_yield_per_hectare" 
              value={formData.expected_yield_per_hectare} 
              onChange={handleChange} 
              className="input-field" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Market Price (₹/unit)</label>
            <input 
              type="number" 
              name="market_price_per_unit" 
              value={formData.market_price_per_unit} 
              onChange={handleChange} 
              className="input-field" 
            />
          </div>
        </div>

        <button 
          onClick={calculateCost} 
          disabled={loading} 
          className="w-full md:w-auto px-6 py-3 bg-yellow-700 text-white font-semibold rounded-lg hover:bg-yellow-800 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <BarChart3 size={20} />
              Calculate Costs
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
      {estimate && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 size={24} className="text-yellow-700" />
            Financial Analysis
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {totalInvestment !== undefined && (
              <div className="p-4 bg-white rounded border-l-4 border-orange-500 shadow">
                <p className="text-sm text-gray-600 font-semibold">Total Investment</p>
                <p className="text-3xl font-bold text-orange-700 mt-2">₹{totalInvestment.toLocaleString()}</p>
              </div>
            )}
            {expectedRevenue !== undefined && (
              <div className="p-4 bg-white rounded border-l-4 border-green-500 shadow">
                <p className="text-sm text-gray-600 font-semibold">Expected Revenue</p>
                <p className="text-3xl font-bold text-green-700 mt-2">₹{expectedRevenue.toLocaleString()}</p>
              </div>
            )}
            {netProfit !== undefined && (
              <div className="p-4 bg-white rounded border-l-4 border-blue-500 shadow">
                <p className="text-sm text-gray-600 font-semibold">Net Profit</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">₹{netProfit.toLocaleString()}</p>
              </div>
            )}
            {roi !== undefined && (
              <div className="p-4 bg-white rounded border-l-4 border-purple-500 shadow">
                <p className="text-sm text-gray-600 font-semibold">Return on Investment</p>
                <p className="text-3xl font-bold text-purple-700 mt-2">{roi}%</p>
              </div>
            )}
          </div>

          {profitMargin !== undefined && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white rounded border-l-4 border-indigo-500 shadow">
                <p className="text-sm text-gray-600 font-semibold">Profit Margin</p>
                <p className="text-2xl font-bold text-indigo-700 mt-2">{profitMargin}%</p>
              </div>
              {breakEvenYield !== undefined && (
                <div className="p-4 bg-white rounded border-l-4 border-cyan-500 shadow">
                  <p className="text-sm text-gray-600 font-semibold">Break-Even Yield</p>
                  <p className="text-2xl font-bold text-cyan-700 mt-2">{breakEvenYield} units</p>
                </div>
              )}
            </div>
          )}

          {riskLevel && (
            <div className="p-4 bg-white rounded border-l-4 border-red-500">
              <p className="font-semibold text-gray-800 mb-1">⚠️ Risk Assessment</p>
              <p className="text-sm text-gray-700">{riskLevel}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CostEstimation;