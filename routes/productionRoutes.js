const express = require('express');
const router = express.Router();
const productionController = require('../controller/productionController');

router.get('/avg-cycle-time', productionController.getAvgCycleTimeLast7Days);

router.get("/getRunning" , productionController.getLatestProductionByMachineType)

router.get("/getHourlyCount/:machineId" , productionController.getAllProductionByMachineTypeHourly)

router.get('/:machineType', productionController.getAllProductionData);





module.exports = router;
