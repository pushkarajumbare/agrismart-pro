/**
 * Disease Detection Routes
 */

const express = require('express');
const multer = require('multer');
const DiseaseController = require('../controllers/diseaseController');

const router = express.Router();

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.post('/scan', upload.single('image'), DiseaseController.scanImage);

module.exports = router;
