const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');

require('dotenv').config();

// Import routes
const diseaseRoutes = require('./routes/diseaseRoutes');
const soilRoutes = require('./routes/soilRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const cropRoutes = require('./routes/cropRoutes');
const costRoutes = require('./routes/costRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const validateRequest = require('./middleware/validateRequest');

// Import utilities
const Logger = require('./utils/logger');
const ResponseHandler = require('./utils/response');

const app = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '').split(',')
].filter(Boolean).map((origin) => origin.trim().replace(/\/+$/, ''));

const allowedOrigins = new Set([
  ...configuredOrigins,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

// CORS configuration supports the deployed frontend and local development.
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request validation and logging
app.use(validateRequest);

// ============================================================================
// ROOT ENDPOINT
// ============================================================================

app.get('/', (req, res) => {
  ResponseHandler.send(res, {
    message: '🚀 AgriSmart Backend Server Running',
    status: 'operational',
    version: '2.0',
    endpoints: {
      disease: '/api/disease/predict',
      soil: '/api/soil/analyze',
      weather: '/api/weather/current',
      crop: '/api/crop/recommend',
      cost: '/api/cost/estimate',
      budget: '/api/budget/all',
      ai: '/api/ai',
      advice: '/api/advice',
      chat: '/api/chat'
    }
  }, 'Server is operational');
});

// ============================================================================
// API ROUTES
// ============================================================================

Logger.info('Registering API routes...');

app.use('/api/disease', diseaseRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/cost', costRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', aiRoutes);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/health', (req, res) => {
  ResponseHandler.send(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgriSmart Pro API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use((req, res) => {
  ResponseHandler.sendError(res, 'Endpoint not found', 404);
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  Logger.success(`Server running on port ${PORT}`);
  Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.info(`API: http://localhost:${PORT}`);
  Logger.info('MongoDB: Disabled (using AI-only architecture)');
});

