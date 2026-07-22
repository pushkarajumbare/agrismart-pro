/**
 * Budget Routes
 * Note: The frontend uses localStorage for budget tracking
 * These routes provide server-side backup options
 */

const express = require('express');
const ResponseHandler = require('../utils/response');
const Logger = require('../utils/logger');

const router = express.Router();

// In-memory storage for budgets (for demo purposes)
let budgetStorage = {};

// Save new expense
router.post('/add', (req, res) => {
    try {
        const { item, amount, location, category, email } = req.body;
        
        if (!item || !amount) {
            return ResponseHandler.sendError(res, 'Item and amount are required', 400);
        }

        const userEmail = email || 'guest';
        if (!budgetStorage[userEmail]) {
            budgetStorage[userEmail] = [];
        }

        const entry = {
            id: Date.now(),
            item,
            amount: parseFloat(amount),
            location: location || 'Not specified',
            category: category || 'General',
            date: new Date().toISOString(),
            email: userEmail
        };

        budgetStorage[userEmail].push(entry);
        Logger.info(`Budget entry added for ${userEmail}`);

        ResponseHandler.send(res, entry, 'Expense added successfully', 201);
    } catch (err) {
        Logger.error('Budget add error', err.message);
        ResponseHandler.sendError(res, 'Failed to add expense', 500);
    }
});

// Get all expenses for user
router.get('/all/:email', (req, res) => {
    try {
        const { email } = req.params;
        const userEmail = email || 'guest';
        const expenses = budgetStorage[userEmail] || [];

        ResponseHandler.send(res, expenses, 'Expenses retrieved successfully', 200);
    } catch (err) {
        Logger.error('Budget get error', err.message);
        ResponseHandler.sendError(res, 'Failed to retrieve expenses', 500);
    }
});

// Delete expense
router.delete('/remove/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userEmail = email || 'guest';

        if (!budgetStorage[userEmail]) {
            return ResponseHandler.sendError(res, 'No expenses found', 404);
        }

        const initialLength = budgetStorage[userEmail].length;
        budgetStorage[userEmail] = budgetStorage[userEmail].filter(e => e.id !== parseInt(id));

        if (budgetStorage[userEmail].length === initialLength) {
            return ResponseHandler.sendError(res, 'Expense not found', 404);
        }

        Logger.info(`Expense ${id} deleted for ${userEmail}`);
        ResponseHandler.send(res, null, 'Expense deleted successfully', 200);
    } catch (err) {
        Logger.error('Budget delete error', err.message);
        ResponseHandler.sendError(res, 'Failed to delete expense', 500);
    }
});

module.exports = router;