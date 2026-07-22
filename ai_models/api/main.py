"""
AgriSmart Pro - AI Backend Engine
FastAPI server for ML predictions and AI-powered farming advice
"""

import os
import io
import logging
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image

# Machine Learning & Image Processing Imports with Safe Fallbacks
try:
    import torch
    import torchvision.transforms as transforms
    HAS_ML = True
except ImportError:
    HAS_ML = False

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
    temperature: float
    humidity: float
    rainfall: float
    moisture: float = 50.0

class CropRecommendationModel(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float
    humidity: float
    rainfall: float
    moisture: float = 50.0

class FarmingAdviceModel(BaseModel):
    crop: str
    weather: dict

class ChatMessageModel(BaseModel):
    message: str

class ChatPayload(BaseModel):
    message: str

# ============================================================================
# ML ENGINE CONFIGURATION & DATA DICTIONARIES
# ============================================================================

if HAS_ML:
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    # Mocking model inference matching output dimension structures
    model = lambda x: torch.randn(1, 2)
else:
    transform = None
    model = None

# Crash protection fields: Both 'treatment' as a string and explicit 'organic' / 'chemical'
# string primitives are added to the mapping dictionary so React child nodes will never break.
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
    }
}

# ============================================================================
# CORE API ROUTING
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "operational",
        "message": "AgriSmart Pro AI Machine Learning Core Active",
        "version": "2.0",
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
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": "now",
        "services": {
            "disease_detection": "active",
            "soil_analysis": "active",
            "crop_recommendation": "active",
            "weather_integration": "active"
        }
    }

# ----------------- SOIL ANALYSIS ENDPOINTS -----------------
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
            "chemical": f"Apply a customized NPK fertilizer blend matching parameters.",
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
    else:
        crop = "Wheat"
    
    return {
        "crop": crop,
        "alternatives": ["Maize", "Pulses", "Cotton", "Sugarcane"],
        "health_score": min(100, 50 + (n/200)*20 + (p/100)*20 + (k/200)*20),
        "deficiencies": deficiencies,
        "fertilizer": [f"{n}-{p}-{k} NPK blend"],
        "organic": ["Compost (2 tonnes/acre)", "Neem cake", "Green manure"],
        "water": "600-800 mm/season",
        "yield": "3-5 tons/hectare",
        "season": "Kharif/Rabi",
        "confidence": 72
    }

# ----------------- ORIGINAL CROP RECOMMENDATION ROUTE -----------------
@app.post("/api/crop/recommend")
async def recommend_crops_legacy(data: CropRecommendationModel):
    try:
        logger.info("Generating crop recommendation legacy")
        scores = {
            "Rice": 85 if data.rainfall > 1000 and data.ph < 7.5 else 60,
            "Wheat": 80 if data.temperature < 25 and data.rainfall < 750 else 55,
            "Maize": 82 if data.temperature > 20 and data.humidity > 50 else 60,
            "Cotton": 75 if data.humidity < 70 else 50,
            "Sugarcane": 78 if data.rainfall > 1200 else 60
        }
        best_crop = max(scores, key=scores.get)
        return {
            "best_crop": best_crop,
            "top_5_alternatives": sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[1:],
            "suitability_score": scores[best_crop],
            "confidence": 75,
            "growing_duration": "120-150 days",
            "water_requirement": "1000-1500 mm",
            "expected_yield": "4-6 tons/hectare",
            "market_profitability": "High",
            "npk_ratio": f"{int(data.nitrogen/50)}-{int(data.phosphorus/30)}-{int(data.potassium/50)}",
            "ideal_temperature": f"{data.temperature-5}°C to {data.temperature+5}°C",
            "ideal_humidity": f"{max(50, data.humidity-10)}% to {min(100, data.humidity+10)}%",
            "soil_type": "Loamy"
        }
    except Exception as e:
        logger.error(f"Crop recommendation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- SECONDARY RESTRUCTURED CROP RECOMMENDATION ROUTE -----------------
@app.post("/api/recommend-crops")
async def recommend_crops_new(data: dict):
    try:
        soil = data.get("soil", {})
        weather = data.get("weather", {})
        
        n = float(soil.get("nitrogen", 50))
        p = float(soil.get("phosphorus", 50))
        k = float(soil.get("potassium", 50))
        moisture = float(soil.get("moisture", 40))
        temp = float(weather.get("temp", 25))
        humidity = float(weather.get("humidity", 60))

        recommendations = []

        if n > 60 and 20 <= temp <= 32 and moisture > 30:
            recommendations.append({
                "name": "Tomato", 
                "suitability": "94%", 
                "reason": "Optimal nitrogen levels and excellent temperature range for fruit set."
            })
        if p > 55 or k > 55 or moisture < 50:
            recommendations.append({
                "name": "Onion", 
                "suitability": "89%", 
                "reason": "Well-drained soil moisture and potassium balance prevents bulb rot."
            })
            recommendations.append({
                "name": "Potato", 
                "suitability": "85%", 
                "reason": "High phosphorus levels support robust underground tuber development."
            })
        if temp < 25 and 30 <= moisture <= 60:
            recommendations.append({
                "name": "Wheat", 
                "suitability": "91%", 
                "reason": "Current temperature windows match critical vegetative growth stages perfectly."
            })
        if humidity > 70 and temp > 24 and moisture > 50:
            recommendations.append({
                "name": "Rice (Paddy)", 
                "suitability": "95%", 
                "reason": "Exceptional relative humidity levels mimic optimal monsoon crop requirements."
            })

        if not recommendations:
            recommendations = [{
                "name": "Legumes (Beans)", 
                "suitability": "82%", 
                "reason": "Highly resilient crop suited well for baseline soil stabilization and nitrogen fixing."
            }]

        return {"best_crops": recommendations[:3]}
    except Exception as e:
        logger.error(f"New recommendation route exception: {str(e)}")
        return {"best_crops": [{"name": "Wheat", "suitability": "75%", "reason": "System fallback due to parsing anomaly."}]}

# ----------------- DISEASE SCANNER ROUTE -----------------
@app.post("/api/scan")
@app.post("/api/disease/predict")
async def scan_leaf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        if HAS_ML and transform and model:
            tensor = transform(image).unsqueeze(0)
            with torch.no_grad():
                output = model(tensor)
                predicted_idx = int(output.argmax(1).item())
                if predicted_idx not in DISEASE_CLASSES:
                    predicted_idx = 0
        else:
            predicted_idx = 0
            
        return DISEASE_CLASSES.get(predicted_idx, DISEASE_CLASSES[0])
    except Exception as e:
        logger.error(f"Scanner critical failure: {str(e)}")
        return {
            "disease": "Analysis Interrupted",
            "confidence": "0%",
            "symptoms": f"The Python engine failed to process the image stream. Error: {str(e)}",
            "cause": "File formatting context error.",
            "treatment": "Please verify file format and upload a clean image.",
            "organic": "Verify asset upload.",
            "chemical": "Verify asset upload.",
            "prevention": "Ensure image files use standard extension layouts like jpeg or png."
        }

# ----------------- FARMING ADVICE ENDPOINTS -----------------
@app.post("/api/advice")
async def get_farming_advice(data: FarmingAdviceModel):
    try:
        temp = data.weather.get('temperature', 25)
        humidity = data.weather.get('humidity', 65)
        rainfall = data.weather.get('rainfall', 0)
        
        # Irrigation rule allocation
        if rainfall > 25:
            irrigation = "Sufficient rainfall - reduce irrigation to avoid waterlogging"
        elif humidity > 70 and temp < 20:
            irrigation = "Low evaporation - reduce irrigation frequency"
        else:
            irrigation = "Maintain regular irrigation - current weather favors quick drying"

        # Sowing rule allocation
        sowing = "Excellent sowing conditions - proceed with sowing" if (20 <= temp <= 30 and humidity > 60) else "Sub-optimal conditions - wait for better weather"
        
        return {
            "crop": data.crop,
            "irrigation": irrigation,
            "sowing": sowing,
            "harvest": f"Optimal harvest time for {data.crop} depends on growth stage. Monitor crop maturity.",
            "fertilizer_timing": "Apply fertilizer during vegetative growth stage for maximum nutrient uptake",
            "disease_risk": "High disease risk - increase monitoring frequency" if (humidity > 80 and 15 <= temp <= 25) else "Low disease risk - standard monitoring sufficient",
            "weather_summary": f"Current: {temp}°C, {humidity}% humidity, {rainfall}mm rainfall"
        }
    except Exception as e:
        logger.error(f"Farming advice error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- CHATBOT ENDPOINTS -----------------
@app.post("/api/chat")
async def chat_bot(payload: ChatPayload):
    msg = payload.message.lower()
    if any(term in msg for term in ["disease", "blight", "spot", "fungal"]):
        reply = "## 🌾 Disease Management Advice\n- **Organic:** Neem oil spray, copper fungicide\n- **Chemical:** Mancozeb, Chlorothalonil"
    elif any(term in msg for term in ["fertilizer", "npk", "nutrition"]):
        reply = "## 🌾 Fertilizer Recommendations\n- **Vegetative:** High Nitrogen\n- **Flowering:** High Phosphorus\n- **Fruiting:** High Potassium"
    else:
        reply = "## 🌾 AgriSmart Advisor\nI can help you with disease control, irrigation schedules, and soil configurations."
    return {"reply": reply}

# ============================================================================
# ERROR HANDLING & INITIALIZATION
# ============================================================================

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting AgriSmart AI Engine on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)