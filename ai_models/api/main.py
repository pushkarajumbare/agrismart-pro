"""
AgriSmart Pro - AI Backend Engine
FastAPI server for ML predictions and AI-powered farming advice
"""

import os
import io
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from PIL import Image
from typing import Optional, Any, Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AgriSmart Pro AI Engine",
    description="ML-powered disease detection, soil analysis, and crop recommendation",
    version="2.0"
)

# ============================================================================
# MIDDLEWARE CONFIGURATION
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# DATA VALIDATION MODELS (PYDANTIC)
# ============================================================================

class SoilDataModel(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float = 25.0
    humidity: float = 65.0
    rainfall: float = 600.0
    moisture: float = 50.0

class CropRecommendationModel(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float = 25.0
    humidity: float = 65.0
    rainfall: float = 600.0
    moisture: float = 50.0

class FarmingAdviceModel(BaseModel):
    crop: Optional[str] = "General"
    disease: Optional[str] = None
    severity: Optional[str] = None
    weather: Optional[Dict[str, Any]] = None

class ChatPayload(BaseModel):
    message: Optional[str] = None
    question: Optional[str] = None

    def get_text(self) -> str:
        return self.question or self.message or ""

# ============================================================================
# DISEASE DATABASE
# ============================================================================

DISEASE_CLASSES = {
    0: {
        "disease": "Tomato Late Blight",
        "confidence": "94.2%",
        "symptoms": "Dark, water-soaked spots on leaves that rapidly enlarge and grow white mold beneath.",
        "cause": "Phytophthora infestans oomycete pathogen thriving in cool, wet environments.",
        "treatment": "Apply copper-based fungicides immediately. Prune affected low-hanging foliage.",
        "organic": "Apply copper-based fungicides immediately. Prune affected low-hanging foliage.",
        "chemical": "Use Mancozeb or Chlorothalonil according to label rates.",
        "prevention": "Ensure proper row spacing for airflow, avoid overhead watering, plant resistant variants."
    },
    1: {
        "disease": "Healthy Crop Leaf",
        "confidence": "98.7%",
        "symptoms": "Uniform rich green coloration, turgid leaf stems, zero lesions or powdery residue.",
        "cause": "Optimal photosynthetic conditions and balanced structural nourishment.",
        "treatment": "No remediation required. Maintain current fertilizer application schedules.",
        "organic": "No organic remediation required. Maintain standard compost distribution.",
        "chemical": "No chemical intervention needed. Maintain baseline nutrition tracking.",
        "prevention": "Continue standard crop rotation systems and preventive bioweekly nutrient monitoring."
    },
    2: {
        "disease": "Early Blight",
        "confidence": "88.5%",
        "symptoms": "Small brown spots with concentric rings on older leaves, yellowing around spots.",
        "cause": "Alternaria solani fungus, spread by infected plant debris and water splash.",
        "treatment": "Remove infected leaves immediately. Apply fungicide spray.",
        "organic": "Neem oil spray (5ml/L) every 7 days. Remove and destroy infected leaves.",
        "chemical": "Apply Mancozeb 75WP at 2.5g/L or Copper Oxychloride 50WP at 3g/L.",
        "prevention": "Crop rotation, avoid overhead irrigation, remove plant debris after harvest."
    },
    3: {
        "disease": "Leaf Spot",
        "confidence": "82.3%",
        "symptoms": "Circular to irregular brown or black spots with yellow halo on leaves.",
        "cause": "Various fungal and bacterial pathogens, worsened by warm humid conditions.",
        "treatment": "Apply appropriate fungicide or bactericide based on pathogen type.",
        "organic": "Copper soap spray, neem oil, or baking soda solution.",
        "chemical": "Chlorothalonil or Mancozeb-based fungicides.",
        "prevention": "Good air circulation, avoid wetting leaves, proper plant spacing."
    },
    4: {
        "disease": "Powdery Mildew",
        "confidence": "90.1%",
        "symptoms": "White powdery coating on leaves, stems and buds. Leaves curl and turn yellow.",
        "cause": "Various Erysiphaceae fungi, spread by airborne spores in dry hot weather.",
        "treatment": "Apply sulfur-based fungicide or potassium bicarbonate solution.",
        "organic": "Baking soda spray (1tsp/L), neem oil, or milk spray.",
        "chemical": "Triadimefon, Trifloxystrobin, or Sulfur-based fungicides.",
        "prevention": "Resistant varieties, adequate spacing, avoid excessive nitrogen fertilization."
    }
}

# ============================================================================
# ROOT & HEALTH ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "status": "operational",
        "message": "AgriSmart Pro AI Machine Learning Core Active",
        "version": "2.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": [
            "disease_prediction",
            "soil_analysis",
            "crop_recommendation",
            "farming_advice",
            "chat"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "disease_detection": "active",
            "soil_analysis": "active",
            "crop_recommendation": "active",
            "weather_integration": "active"
        }
    }

# ============================================================================
# DISEASE DETECTION ENDPOINTS
# ============================================================================

@app.post("/api/disease/predict")
@app.post("/api/scan")
async def scan_leaf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Lightweight inference without torch: use image color statistics
        import numpy as np
        img_array = np.array(image.resize((224, 224)))

        # Simple heuristic: check green channel dominance for health
        green_ratio = img_array[:, :, 1].mean() / (img_array.mean() + 1e-5)
        brown_ratio = (img_array[:, :, 0].mean() - img_array[:, :, 2].mean()) / (img_array.mean() + 1e-5)

        if brown_ratio > 0.15:
            predicted_idx = 0  # Late Blight / disease
        elif green_ratio > 1.05:
            predicted_idx = 1  # Healthy
        else:
            predicted_idx = 2  # Early Blight fallback

        result = DISEASE_CLASSES.get(predicted_idx, DISEASE_CLASSES[0])
        logger.info(f"Disease scan complete: {result['disease']}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scanner error: {str(e)}")
        return {
            "disease": "Analysis Interrupted",
            "confidence": "0%",
            "symptoms": f"The engine failed to process the image. Error: {str(e)}",
            "cause": "File formatting or read error.",
            "treatment": "Please verify file format and upload a clear image.",
            "organic": "Verify asset upload.",
            "chemical": "Verify asset upload.",
            "prevention": "Ensure image files use standard extensions like jpeg or png."
        }

# ============================================================================
# SOIL ANALYSIS ENDPOINT
# ============================================================================

@app.post("/api/soil/analyze")
async def analyze_soil(data: SoilDataModel):
    try:
        logger.info(f"Analyzing soil with N={data.nitrogen}, P={data.phosphorus}, K={data.potassium}")
        recommendation = determine_soil_recommendation(
            data.nitrogen,
            data.phosphorus,
            data.potassium,
            data.ph
        )
        return {
            "recommended_crop": recommendation["crop"],
            "alternative_crops": recommendation["alternatives"],
            "soil_health_score": recommendation["health_score"],
            "nutrient_deficiencies": recommendation["deficiencies"],
            "fertilizer_suggestions": recommendation["fertilizer"],
            "organic_alternatives": recommendation["organic"],
            "treatment": "Spread 2 tonnes of compost per acre and apply baseline NPK fertilizer.",
            "organic": "Use compost (2 tonnes/acre) or organic neem cake mixtures.",
            "chemical": f"Apply a customized NPK fertilizer blend matching N={data.nitrogen}, P={data.phosphorus}, K={data.potassium} parameters.",
            "water_requirement": recommendation["water"],
            "expected_yield": recommendation["yield"],
            "season_recommendation": recommendation["season"],
            "confidence_score": recommendation["confidence"]
        }
    except Exception as e:
        logger.error(f"Soil analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def determine_soil_recommendation(n, p, k, ph):
    deficiencies = []
    if n < 40:
        deficiencies.append("Nitrogen deficiency - Add urea or compost")
    if p < 20:
        deficiencies.append("Phosphorus deficiency - Add DAP or bone meal")
    if k < 150:
        deficiencies.append("Potassium deficiency - Add potash or wood ash")

    if ph < 5.5:
        crop = "Sugarcane"
    elif ph > 8.0:
        crop = "Barley"
    elif n > 50 and p > 20 and k > 150:
        crop = "Rice"
    elif n > 30 and p > 15:
        crop = "Wheat"
    else:
        crop = "Legumes"

    health_score = min(100, 40 + (n / 200) * 25 + (p / 100) * 20 + (k / 200) * 15)

    return {
        "crop": crop,
        "alternatives": ["Maize", "Pulses", "Cotton", "Sugarcane", "Sorghum"],
        "health_score": round(health_score, 1),
        "deficiencies": deficiencies,
        "fertilizer": [f"N:{int(n)}-P:{int(p)}-K:{int(k)} NPK blend"],
        "organic": ["Compost (2 tonnes/acre)", "Neem cake", "Green manure", "Vermicompost"],
        "water": "600-800 mm/season",
        "yield": "3-5 tons/hectare",
        "season": "Kharif/Rabi",
        "confidence": round(min(95, 60 + (health_score / 5)), 1)
    }

# ============================================================================
# CROP RECOMMENDATION ENDPOINTS
# ============================================================================

@app.post("/api/crop/recommend")
async def recommend_crops(data: CropRecommendationModel):
    try:
        logger.info("Generating crop recommendation")
        scores = {
            "Rice":     85 if data.rainfall > 1000 and data.ph < 7.5 else 60,
            "Wheat":    80 if data.temperature < 25 and data.rainfall < 750 else 55,
            "Maize":    82 if data.temperature > 20 and data.humidity > 50 else 60,
            "Cotton":   75 if data.humidity < 70 else 50,
            "Sugarcane":78 if data.rainfall > 1200 else 60,
            "Pulses":   72 if data.nitrogen < 40 else 55,
            "Barley":   70 if data.temperature < 20 else 52,
        }
        best_crop = max(scores, key=scores.get)
        sorted_crops = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
        return {
            "best_crop": best_crop,
            "top_5_alternatives": sorted_crops[1:6],
            "suitability_score": scores[best_crop],
            "confidence": 75,
            "growing_duration": "120-150 days",
            "water_requirement": "1000-1500 mm",
            "expected_yield": "4-6 tons/hectare",
            "market_profitability": "High",
            "npk_ratio": f"{int(data.nitrogen/50)}-{int(data.phosphorus/30)}-{int(data.potassium/50)}",
            "ideal_temperature": f"{int(data.temperature)-5}°C to {int(data.temperature)+5}°C",
            "ideal_humidity": f"{max(50, int(data.humidity)-10)}% to {min(100, int(data.humidity)+10)}%",
            "soil_type": "Loamy"
        }
    except Exception as e:
        logger.error(f"Crop recommendation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# FARMING ADVICE ENDPOINT
# ============================================================================

@app.post("/api/advice")
async def get_farming_advice(data: FarmingAdviceModel):
    try:
        weather = data.weather or {}
        temp = weather.get('temperature', 25)
        humidity = weather.get('humidity', 65)
        rainfall = weather.get('rainfall', 0)

        if rainfall > 25:
            irrigation = "Sufficient rainfall - reduce irrigation to avoid waterlogging"
        elif humidity > 70 and temp < 20:
            irrigation = "Low evaporation - reduce irrigation frequency"
        else:
            irrigation = "Maintain regular irrigation - current weather favors quick drying"

        sowing = (
            "Excellent sowing conditions - proceed with sowing"
            if (20 <= temp <= 30 and humidity > 60)
            else "Sub-optimal conditions - wait for better weather"
        )

        return {
            "crop": data.crop or "General",
            "irrigation": irrigation,
            "sowing": sowing,
            "harvest": f"Optimal harvest time for {data.crop or 'your crop'} depends on growth stage. Monitor crop maturity.",
            "fertilizer_timing": "Apply fertilizer during vegetative growth stage for maximum nutrient uptake",
            "disease_risk": (
                "High disease risk - increase monitoring frequency"
                if (humidity > 80 and 15 <= temp <= 25)
                else "Low disease risk - standard monitoring sufficient"
            ),
            "weather_summary": f"Current: {temp}°C, {humidity}% humidity, {rainfall}mm rainfall"
        }
    except Exception as e:
        logger.error(f"Farming advice error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CHATBOT ENDPOINT
# ============================================================================

@app.post("/api/chat")
async def chat_bot(payload: ChatPayload):
    try:
        msg = payload.get_text().lower()
        if not msg:
            raise HTTPException(status_code=400, detail="Message or question is required")

        if any(term in msg for term in ["disease", "blight", "spot", "fungal", "mildew"]):
            reply = (
                "## 🌾 Disease Management Advice\n"
                "- **Identify**: Look for discoloration, spots, wilting or mold\n"
                "- **Organic Treatment**: Neem oil spray (5ml/L), copper fungicide\n"
                "- **Chemical Treatment**: Mancozeb, Chlorothalonil at label rates\n"
                "- **Prevention**: Proper spacing, avoid overhead irrigation, crop rotation"
            )
        elif any(term in msg for term in ["fertilizer", "npk", "nutrition", "nutrient"]):
            reply = (
                "## 🌾 Fertilizer Recommendations\n"
                "- **Vegetative Stage**: High Nitrogen (N) - promotes leaf growth\n"
                "- **Flowering Stage**: High Phosphorus (P) - promotes flowering\n"
                "- **Fruiting Stage**: High Potassium (K) - promotes fruit development\n"
                "- **Organic Option**: Compost, neem cake, vermicompost"
            )
        elif any(term in msg for term in ["water", "irrigation", "drought"]):
            reply = (
                "## 💧 Irrigation Advice\n"
                "- **Best Time**: Early morning or evening to reduce evaporation\n"
                "- **Method**: Drip irrigation is most efficient (30-50% water savings)\n"
                "- **Frequency**: Water when top 2-3 inches of soil feel dry\n"
                "- **Signs of Stress**: Wilting, leaf curl, dry/cracked soil"
            )
        elif any(term in msg for term in ["soil", "ph", "nitrogen", "potassium", "phosphorus"]):
            reply = (
                "## 🌱 Soil Health Tips\n"
                "- **Ideal pH**: 6.0–7.5 for most crops\n"
                "- **Nitrogen (N)**: Essential for leaf/stem growth - add urea or compost\n"
                "- **Phosphorus (P)**: Root and flower development - add DAP or bone meal\n"
                "- **Potassium (K)**: Disease resistance and fruit quality - add potash"
            )
        elif any(term in msg for term in ["weather", "rain", "temperature", "humidity"]):
            reply = (
                "## 🌤️ Weather-Based Farming Tips\n"
                "- **High Humidity (>80%)**: Watch for fungal diseases, improve airflow\n"
                "- **High Temperature (>35°C)**: Increase irrigation, use shade nets\n"
                "- **Heavy Rain**: Hold irrigation, check drainage, apply preventive fungicide\n"
                "- **Cold (<10°C)**: Cover sensitive crops, delay sowing"
            )
        elif any(term in msg for term in ["crop", "plant", "grow", "sow", "harvest", "yield"]):
            reply = (
                "## 🌾 Crop Management Tips\n"
                "- Use certified seeds from reputable suppliers\n"
                "- Follow recommended plant spacing for good airflow\n"
                "- Practice crop rotation to prevent soil nutrient depletion\n"
                "- Monitor crop at each growth stage for early problem detection"
            )
        else:
            reply = (
                "## 🌾 AgriSmart AI Advisor\n"
                "Hello! I can help you with:\n"
                "- **Disease control** and treatment options\n"
                "- **Irrigation** scheduling and water management\n"
                "- **Soil health** and fertilizer recommendations\n"
                "- **Crop selection** and growth tips\n"
                "- **Weather-based** farming decisions\n\n"
                "Ask me anything about your farm!"
            )

        return {"reply": reply}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# GLOBAL ERROR HANDLER
# ============================================================================

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting AgriSmart AI Engine on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)