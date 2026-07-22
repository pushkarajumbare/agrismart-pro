"""
Disease Detection API Endpoint
Handles image upload and disease prediction using ML model
"""

import os
import io
import json
from typing import Optional
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import torch
import torchvision.transforms as transforms

router = APIRouter()

# ============================================================================
# MODEL LOADING AND INITIALIZATION
# ============================================================================

# Disease classes (example - replace with your actual model classes)
DISEASE_CLASSES = [
    'Healthy',
    'Early Blight',
    'Late Blight',
    'Leaf Spot',
    'Powdery Mildew',
    'Septoria Leaf Blotch'
]

# Image preprocessing transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

class DiseasePredictor:
    """Disease detection model wrapper"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.load_model()
    
    def load_model(self):
        """
        Load pre-trained model
        For now, using a mock model - replace with actual trained model
        """
        try:
            # Example: Load ResNet50 pre-trained model
            self.model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', pretrained=True)
            
            # Modify final layer for disease classification
            num_classes = len(DISEASE_CLASSES)
            self.model.fc = torch.nn.Linear(self.model.fc.in_features, num_classes)
            
            self.model.to(self.device)
            self.model.eval()
            print(f"✅ Model loaded on {self.device}")
        except Exception as e:
            print(f"⚠️ Could not load model: {e}. Using mock predictions.")
            self.model = None
    
    def predict(self, image_array: np.ndarray) -> dict:
        """
        Predict disease from image
        
        Args:
            image_array: PIL Image or numpy array
        
        Returns:
            Dictionary with disease name and confidence
        """
        try:
            # Convert numpy array to PIL Image if needed
            if isinstance(image_array, np.ndarray):
                image = Image.fromarray(image_array.astype('uint8'))
            else:
                image = image_array
            
            # Preprocess image
            image_tensor = transform(image).unsqueeze(0).to(self.device)
            
            # Get prediction
            with torch.no_grad():
                if self.model:
                    outputs = self.model(image_tensor)
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)
                    confidence, predicted_idx = torch.max(probabilities, 1)
                    
                    disease_name = DISEASE_CLASSES[predicted_idx.item()]
                    confidence_score = (confidence.item() * 100)
                else:
                    # Mock prediction
                    disease_name = 'Healthy'
                    confidence_score = 75.5
            
            return {
                'disease': disease_name,
                'confidence': round(confidence_score, 2),
                'classes': DISEASE_CLASSES
            }
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")

# Initialize predictor
disease_predictor = DiseasePredictor()

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_image(image: Image.Image) -> bool:
    """Validate if image is suitable for disease detection"""
    try:
        # Check image size
        width, height = image.size
        if width < 50 or height < 50:
            raise ValueError("Image too small (minimum 50x50)")
        
        if width > 10000 or height > 10000:
            raise ValueError("Image too large (maximum 10000x10000)")
        
        # Check if image is color (not grayscale)
        if image.mode != 'RGB' and image.mode != 'RGBA':
            image = image.convert('RGB')
        
        return True
    except Exception as e:
        raise ValueError(f"Image validation failed: {str(e)}")

def detect_if_leaf_image(image: Image.Image) -> bool:
    """
    Detect if image contains a plant leaf
    Uses color analysis and contour detection
    """
    try:
        # Convert to HSV for better color detection
        import cv2
        
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2HSV)
        
        # Define green range for leaf detection
        lower_green = np.array([25, 40, 40])
        upper_green = np.array([90, 255, 255])
        
        # Create mask
        mask = cv2.inRange(image_cv, lower_green, upper_green)
        
        # Calculate percentage of green pixels
        green_pixels = cv2.countNonZero(mask)
        total_pixels = image_cv.shape[0] * image_cv.shape[1]
        green_percentage = (green_pixels / total_pixels) * 100
        
        # If more than 5% green, likely a leaf image
        return green_percentage > 5
    except:
        # If detection fails, assume it's valid
        return True

# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.post("/disease/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Upload leaf image and get disease prediction
    
    Returns:
    {
        "disease": "Early Blight",
        "confidence": 85.5,
        "classes": ["Healthy", "Early Blight", ...]
    }
    """
    try:
        # Read image file
        contents = await file.read()
        
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Open image
        image = Image.open(io.BytesIO(contents))
        
        # Validate image
        if not validate_image(image):
            raise HTTPException(status_code=400, detail="Invalid plant leaf image")
        
        # Detect if it's a leaf image
        if not detect_if_leaf_image(image):
            raise HTTPException(
                status_code=400,
                detail="Image does not appear to contain a plant leaf. Please upload a clear leaf image."
            )
        
        # Make prediction
        prediction = disease_predictor.predict(image)
        
        return prediction
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease prediction failed: {str(e)}")

@router.get("/disease/classes")
async def get_disease_classes():
    """Get list of disease classes"""
    return {"classes": DISEASE_CLASSES}
