const express = require('express');
const router = express.Router();
const downtimeController = require('../controller/downtimeController');

router.get('/byrunningplaniddowntime/:machineId', downtimeController.getDowntimeByMachinebyRunning);

router.get('/bymachineid/:machine_id', downtimeController.getDowntimeByMachine);


// READ ALL
router.get('/', downtimeController.getAllDowntimes);

// READ BY ID
router.get('/:id', downtimeController.getDowntimeById);

// UPDATE
router.put('/:id', downtimeController.updateDowntime);

// DELETE
router.delete('/:id', downtimeController.deleteDowntime);

module.exports = router;
