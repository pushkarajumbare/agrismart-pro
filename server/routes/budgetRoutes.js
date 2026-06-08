const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget'); // This line now works!

// Save new expense
router.post('/add', async (req, res) => {
    try {
        const newEntry = new Budget(req.body);
        const saved = await newEntry.save();
        res.status(200).json(saved);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all expenses
router.get('/all', async (req, res) => {
    try {
        const budgets = await Budget.find();
        res.status(200).json(budgets);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;