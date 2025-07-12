

const express = require('express');
const router = express.Router();
const machineController = require('../controller/machineController');

// Create
router.post('/register', machineController.registerMachine);

// Read
router.get('/getallmachineids', machineController.getAllMachineIds);
router.get('/active-count', machineController.getActiveMachinesCount);
router.get('/inactive-count', machineController.getInActiveMachinesCount);
router.get('/allactivecount', machineController.getActiveMachines);
router.get('/:organizationId', machineController.getMachinesByOrganization);
router.get('/machines/bottleneck-ids', machineController.getBottleneckMachineIds);
router.get('/machines/:machineId', machineController.getMachineById);

// Update
router.put('/machines/:machineId', machineController.updateMachine);

// Delete
router.delete('/machines/:machineId', machineController.deleteMachine);

module.exports = router;
