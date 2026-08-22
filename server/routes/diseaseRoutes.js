/**
 * Disease Detection Routes
 */

const express = require('express');
const multer = require('multer');
const DiseaseController = require('../controllers/diseaseController');

const router = express.Router();

// Configure multer for image upload accepting both 'file' and 'image' form fields
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadMiddleware = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// Routes
router.post('/scan', uploadMiddleware, DiseaseController.scanImage);
router.post('/predict', uploadMiddleware, DiseaseController.scanImage);
router.post('/', uploadMiddleware, DiseaseController.scanImage);

module.exports = router;
