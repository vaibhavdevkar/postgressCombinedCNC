const express = require('express');
const router = express.Router();
const monitoringController = require('../controller/monitoringController');

router.get('/:machineType', monitoringController.getAllMonitoringData);

module.exports = router;
