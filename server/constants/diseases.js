/**
 * Plant Disease Database
 * Comprehensive disease information for treatment recommendations
 */

const DISEASE_DATABASE = {
  'Early Blight': {
    severity: 'Medium',
    symptoms: 'Brown concentric spots with yellow halos on lower leaves, progresses upward',
    causes: 'Fungal infection (Alternaria solani), high humidity, poor air circulation',
    organic_treatment: [
      'Prune infected lower leaves (15cm from soil)',
      'Apply neem oil every 7-10 days',
      'Use sulfur dust for prevention',
      'Increase spacing for airflow'
    ],
    chemical_treatment: [
      'Copper oxychloride: 2g/L water',
      'Mancozeb: 2.5g/L water',
      'Chlorothalonil: Follow label instructions',
      'Apply every 7 days if infection persists'
    ],
    prevention: [
      'Use drip irrigation only',
      'Avoid wetting foliage',
      'Stake plants for airflow',
      'Mulch soil to prevent splash',
      'Remove lower leaves as preventive measure'
    ],
    fertilizer: 'Balanced NPK (10:10:10) after pruning',
    pesticide: 'Copper-based fungicides',
    irrigation: 'Drip only, early morning',
    recovery_time: '14-21 days',
    suitable_weather: 'Dry, low humidity (below 70%)',
    yield_impact: '20-40% reduction if untreated'
  },
  'Late Blight': {
    severity: 'High',
    symptoms: 'Water-soaked lesions on leaves, white mold on leaf undersides, affects fruits',
    causes: 'Phytophthora infestans, high humidity (85%+), cool temperatures (15-20°C)',
    organic_treatment: [
      'Remove infected leaves immediately',
      'Apply Bordeaux mixture (1%) weekly',
      'Use potato starch spray',
      'Ensure excellent air circulation'
    ],
    chemical_treatment: [
      'Metalaxyl + Mancozeb: 2.5g/L',
      'Fluoxastrobin + Tebuconazole',
      'Apply every 5-7 days during wet season',
      'Spray both leaf surfaces thoroughly'
    ],
    prevention: [
      'Plant resistant varieties',
      'Avoid overhead irrigation',
      'Remove volunteer plants',
      'Practice crop rotation',
      'Destroy infected plant debris'
    ],
    fertilizer: 'Potassium-rich (lower N)',
    pesticide: 'Systemic fungicides',
    irrigation: 'Drip irrigation only',
    recovery_time: '21-30 days',
    suitable_weather: 'Dry, warm (above 20°C), low humidity',
    yield_impact: '50-100% loss if untreated'
  },
  'Leaf Spot': {
    severity: 'Low',
    symptoms: 'Small brown spots with yellow halo, may have concentric rings',
    causes: 'Various fungal pathogens, overcrowding, poor air circulation',
    organic_treatment: [
      'Remove affected leaves',
      'Apply neem oil solution',
      'Use sulfur-based fungicide',
      'Improve plant spacing'
    ],
    chemical_treatment: [
      'Copper fungicide: 2g/L',
      'Propineb: 1.5g/L',
      'Apply every 7-10 days',
      'Alternate fungicides to prevent resistance'
    ],
    prevention: [
      'Maintain proper spacing',
      'Ensure good air circulation',
      'Water at soil level only',
      'Remove lower leaves regularly',
      'Clean pruning tools between cuts'
    ],
    fertilizer: 'Balanced NPK',
    pesticide: 'Copper-based fungicides',
    irrigation: 'Regular, avoid foliage',
    recovery_time: '7-14 days',
    suitable_weather: 'Dry, moderate humidity',
    yield_impact: '5-15% reduction'
  },
  'Healthy': {
    severity: 'None',
    symptoms: 'No disease present. Green, vibrant foliage with normal morphology.',
    causes: 'N/A - Plant is in good health',
    organic_treatment: ['Maintain current care practices'],
    chemical_treatment: ['No treatment needed'],
    prevention: [
      'Continue regular monitoring',
      'Maintain proper watering schedule',
      'Ensure adequate sunlight',
      'Provide balanced nutrition'
    ],
    fertilizer: 'Continue regular schedule',
    pesticide: 'No pesticide needed',
    irrigation: 'Regular schedule',
    recovery_time: 'N/A',
    suitable_weather: 'Optimal growth conditions',
    yield_impact: 'No impact'
  }
};

module.exports = DISEASE_DATABASE;
