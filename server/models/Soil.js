const mongoose = require('mongoose');

const SoilSchema = new mongoose.Schema({
    ph: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    recommendation: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Soil', SoilSchema);