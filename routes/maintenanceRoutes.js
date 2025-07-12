// routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controller/maintenanceController');

router.post('/', controller.createMaintenanceSchedule);
router.get('/', controller.getAllMaintenanceSchedules);
router.get('/:id', controller.getMaintenanceScheduleById);
router.put('/:id', controller.updateMaintenanceSchedule);
router.delete('/:id', controller.deleteMaintenanceSchedule);

module.exports = router;
