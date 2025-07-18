const express = require('express');
const router = express.Router();
const {
  getTodayBottleneckMachineStatus
} = require('../controller/machinestatusController');

// GET /api/machine-status/bottleneck/today
router.get('/bottleneckRuntimeDowntime/today', getTodayBottleneckMachineStatus);

module.exports = router;
