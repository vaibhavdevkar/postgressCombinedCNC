const express = require('express');
const router = express.Router();
const planentryController = require('../controller/planEntryController');



// GET all plan entries
router.get('/', planentryController.getAllPlanEntries);

// GET single plan entry by ID
router.get('/:id', planentryController.getPlanEntryById);

router.get('/running/:machine_id', planentryController.getRunningPlansByMachineId);

module.exports = router;
