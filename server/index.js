const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

require('dotenv').config();

const budgetRoutes = require('./routes/budgetRoutes');
const soilRoutes = require('./routes/soilRoutes');

const app = express();

const offlineAdvisorReply = `## 🌾 Field Crop Diagnostic Matrix
- **Current Assessment:** The AI engine is reconnecting, so use a conservative field protocol until live model metrics return.
- **Risk Evaluation:** Medium operational risk from incomplete telemetry. Avoid full-plot chemical spending until symptoms, soil values, or weather stress are confirmed.

## 💡 Tactical Action Plan (Step-by-Step)
1. **Immediate Remedy:** Inspect 10 plants across the plot, record affected leaves, and isolate diseased foliage from healthy canopy zones.
2. **Resource Treatment:** If fungal spotting is visible, prune infected lower leaves and apply copper-based fungicide at 2 g/L of water to affected blocks only.
3. **Preventative Controls:** Use drip irrigation, keep foliage dry, improve row airflow, and retry AI analysis once the service reconnects.

## 📊 Financial & Resource Impact
- Use manual sanitation and spot treatment first. This protects the Expense Ledger from unnecessary full-plot spraying and keeps spend in ₹ under control.`;

// ---------------- GLOBAL MIDDLEWARE (CRITICAL TOP PLACEMENT) ----------------
app.use(cors());
app.use(express.json()); // ✅ Safely processes JSON bodies for recommendations, budgets, and chat

// Store uploaded image temporarily inside system RAM
const upload = multer();

// ---------------- DATABASE CONNECTION ----------------
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrismart';

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('✅ Database Connected: AgriSmart is now saving data!');
  })
  .catch((err) => {
    console.error('❌ Database Connection Error:', err);
  });

// ---------------- ROOT DIAGNOSTIC CHECK ----------------
app.get('/', (req, res) => {
  res.json({ message: '🚀 AgriSmart Backend Server Running Perfectly!' });
});

// ---------------- CROP RECOMMENDATION ROUTE ----------------
app.post('/api/recommendations', async (req, res) => {
    try {
        console.log("📊 Compiling environmental conditions for AI evaluation...");
        
        // Pass the request payload containing soil and weather structures straight to Python
        const response = await axios.post('http://127.0.0.1:8000/api/recommend-crops', req.body);
        
        res.json(response.data);
    } catch (error) {
        console.error("❌ Recommendation Pipeline Error:", error.message);
        res.json({
          best_crops: [
            {
              name: 'Legumes (Beans)',
              suitability: '82%',
              reason: 'Offline fallback: resilient crop option for baseline soil recovery while the AI engine reconnects.'
            },
            {
              name: 'Wheat',
              suitability: '75%',
              reason: 'Offline fallback: stable recommendation for moderate moisture and cooler growth windows.'
            }
          ],
          offline: true
        });
    }
});

// ---------------- WEATHER API ----------------
app.get('/api/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error('❌ Weather Error:', error.message);
    res.status(404).json({ message: 'City not found or Weather API failed.' });
  }
});

// ---------------- CHATBOT ROUTE ----------------
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
        'http://127.0.0.1:8000/api/chat',
        { message },
        { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error('❌ Chat Server Error:', error.message);
    res.json({
      reply: offlineAdvisorReply,
      offline: true
    });
  }
});

// ---------------- DISEASE SCANNER API ROUTE ----------------
app.post('/api/scan', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          disease: 'No File Uploaded',
          confidence: '0%',
          symptoms: 'No image file was selected.',
          cause: 'React frontend did not send an image.',
          treatment: 'Please upload a leaf image.',
          prevention: 'Select a valid crop leaf image before scanning.'
        });
      }

      console.log('➡️ Received image from React. Forwarding to Python AI...');

      const pythonFormData = new FormData();
      pythonFormData.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
      });

      const pythonResponse = await axios.post(
          'http://127.0.0.1:8000/api/scan',
          pythonFormData,
          {
            headers: { ...pythonFormData.getHeaders() },
            timeout: 15000
          }
      );

      console.log('⬅️ Python server handled scan successfully!');
      res.json(pythonResponse.data);

    } catch (error) {
      console.error('❌ Node Scanning Error:', error.message);
      res.json({
        disease: 'AI Offline Fallback',
        confidence: '0%',
        symptoms: 'The image was received, but the AI engine did not respond in time.',
        cause: 'Python backend on port 8000 may be offline or busy.',
        treatment: 'Keep the uploaded image selected and retry scan after the AI service reconnects.',
        prevention: 'The dashboard remains usable; saved expense and history records are not affected by this AI outage.',
        offline: true
      });
    }
  }
);

// ---------------- REGISTERED APP FEATURES SUB-ROUTES ----------------
app.use('/api/budget', budgetRoutes);
app.use('/api/soil', soilRoutes);

// ---------------- START SERVER ENGINE ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
