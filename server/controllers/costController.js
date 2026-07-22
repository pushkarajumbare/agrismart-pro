/**
 * Cost Estimation Controller
 * Handles cost estimation endpoints
 */

const ResponseHandler = require('../utils/response');
const Logger = require('../utils/logger');

// Cost database for different crops (in rupees per hectare)
const CROP_COSTS = {
  'Rice': {
    seed: 1500,
    fertilizer: 3000,
    labor: 5000,
    irrigation: 2000,
    machinery: 1500,
    transportation: 1000,
    pesticides: 1000
  },
  'Wheat': {
    seed: 1200,
    fertilizer: 2500,
    labor: 4000,
    irrigation: 1500,
    machinery: 1000,
    transportation: 800,
    pesticides: 800
  },
  'Maize': {
    seed: 2000,
    fertilizer: 3500,
    labor: 5500,
    irrigation: 2500,
    machinery: 2000,
    transportation: 1200,
    pesticides: 1200
  },
  'Cotton': {
    seed: 2500,
    fertilizer: 4000,
    labor: 8000,
    irrigation: 3000,
    machinery: 2500,
    transportation: 1500,
    pesticides: 2000
  },
  'default': {
    seed: 1500,
    fertilizer: 3000,
    labor: 5000,
    irrigation: 2000,
    machinery: 1500,
    transportation: 1000,
    pesticides: 1000
  }
};

const CostController = {
  /**
   * POST /api/cost/estimate
   * Estimate total cost and profit
   */
  estimateCost: async (req, res, next) => {
    try {
      const { crop, area_hectares, expected_yield_per_hectare, market_price_per_unit } = req.body;

      // Validation
      if (!crop || !area_hectares) {
        return ResponseHandler.sendError(
          res,
          'Crop and land area are required',
          400
        );
      }

      const area = parseFloat(area_hectares);
      const yield_per_ha = parseFloat(expected_yield_per_hectare) || 4;
      const price_per_unit = parseFloat(market_price_per_unit) || 2000;

      if (area <= 0 || area > 1000) {
        return ResponseHandler.sendError(res, 'Area must be between 0-1000 hectares', 400);
      }

      Logger.info(`Estimating cost for ${crop} on ${area} hectares`);

      // Get costs for crop
      const cropCost = CROP_COSTS[crop] || CROP_COSTS.default;

      // Calculate totals
      const seedCost = cropCost.seed * area;
      const fertilizerCost = cropCost.fertilizer * area;
      const laborCost = cropCost.labor * area;
      const irrigationCost = cropCost.irrigation * area;
      const machineryCost = cropCost.machinery * area;
      const transportationCost = cropCost.transportation * area;
      const pesticideCost = cropCost.pesticides * area;

      const totalInvestment = seedCost + fertilizerCost + laborCost + irrigationCost +
                              machineryCost + transportationCost + pesticideCost;

      // Calculate revenue
      const totalYield = yield_per_ha * area; // in units
      const expectedRevenue = totalYield * price_per_unit;

      // Calculate profit
      const netProfit = expectedRevenue - totalInvestment;
      const roiNum = Number(((netProfit / totalInvestment) * 100).toFixed(2));
      const profitMarginNum = Number(((netProfit / expectedRevenue) * 100).toFixed(2));
      const breakEvenYieldNum = Number(((totalInvestment / price_per_unit) / area).toFixed(2));
      const riskLevelVal = breakEvenYieldNum > yield_per_ha * 0.8 ? 'High' : 'Low';

      const response = {
        crop,
        area_hectares: area,

        // Flat properties expected by frontend
        totalInvestment: totalInvestment,
        expectedRevenue: expectedRevenue,
        netProfit: netProfit,
        roi: roiNum,
        profitMargin: profitMarginNum,
        breakEvenYield: breakEvenYieldNum,
        riskLevel: riskLevelVal,

        // Detailed categorised breakdown
        cost_breakdown: {
          seed_cost: seedCost,
          fertilizer_cost: fertilizerCost,
          labor_cost: laborCost,
          irrigation_cost: irrigationCost,
          machinery_cost: machineryCost,
          transportation_cost: transportationCost,
          pesticide_cost: pesticideCost,
          total_investment: totalInvestment
        },
        revenue: {
          expected_yield: totalYield,
          yield_unit: 'quintals',
          market_price_per_unit: price_per_unit,
          expected_revenue: expectedRevenue
        },
        profitability: {
          net_profit: netProfit,
          roi_percentage: roiNum.toFixed(2),
          profit_margin: profitMarginNum.toFixed(2)
        },
        break_even: {
          yield_required: breakEvenYieldNum.toFixed(2),
          yield_unit: 'quintals per hectare',
          risk_level: riskLevelVal
        }
      };

      ResponseHandler.send(
        res,
        response,
        'Cost estimation successful',
        200
      );
    } catch (error) {
      Logger.error('Cost estimation error', error.message);
      ResponseHandler.sendError(res, 'Cost estimation failed', 500);
    }
  }
};

module.exports = CostController;