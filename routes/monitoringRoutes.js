const express = require('express');
const router = express.Router();
const monitoringController = require('../controller/monitoringController');

router.get('/:machineType', monitoringController.getAllMonitoringData);

router.get('/:machineType/latest', monitoringController.getLatestMonitoringData);


module.exports = router;
