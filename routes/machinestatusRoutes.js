const express = require('express');
const router = express.Router();
const {
  getTodayBottleneckMachineStatus,
  getMachineStatusTodayByMachine
} = require('../controller/machinestatusController');


router.get('/getstatusbymachineId/:machineId', getMachineStatusTodayByMachine);

// GET /api/machine-status/bottleneck/today
router.get('/bottleneckRuntimeDowntime/today', getTodayBottleneckMachineStatus);



module.exports = router;
