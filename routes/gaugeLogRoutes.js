const express = require('express');
const router = express.Router();
const gaugeLogController = require('../controller/gaugeLogController');

// Create a new gauge log
router.post('/gauge-logs', gaugeLogController.createGaugeLog);

// Get all gauge logs
router.get('/gauge-logs', gaugeLogController.getAllGaugeLogs);

// Get a single gauge log by ID
router.get('/gauge-logs/:id', gaugeLogController.getGaugeLogById);

// Update a gauge log
router.put('/gauge-logs/:id', gaugeLogController.updateGaugeLog);

// Delete a gauge log
router.delete('/gauge-logs/:id', gaugeLogController.deleteGaugeLog);

module.exports = router;