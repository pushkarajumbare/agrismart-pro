const express = require('express');
const router = express.Router();
const Soil = require('../models/Soil');

// Save Soil Analysis and give a quick recommendation
router.post('/analyze', async (req, res) => {
    try {
        const { ph, nitrogen, phosphorus, potassium } = req.body;
        
        // Simple logic: You can expand this later!
        let advice = "Soil levels are within normal range.";
        if (ph < 6) advice = "Soil is too acidic. Add agricultural lime.";
        if (nitrogen < 20) advice = "Nitrogen is low. Add Urea or compost.";

        const newSoilData = new Soil({
            ...req.body,
            recommendation: advice
        });

        const savedSoil = await newSoilData.save();
        res.status(200).json(savedSoil);
    } catch (err) {
        res.status(500).json({ error: "Failed to process soil data" });
    }
});

module.exports = router;