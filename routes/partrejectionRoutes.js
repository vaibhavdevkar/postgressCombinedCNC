const express = require('express');
const router = express.Router();
const partRejectionController = require('../controller/partrejectionController');

// CREATE
router.get('/today/:machineId', partRejectionController.getTodayPartRejectionsByMachine);

router.get('/bymachineid/:machineId', partRejectionController.getPartRejectionsByMachine);

router.post('/', partRejectionController.createPartRejection);

// READ ALL
router.get('/', partRejectionController.getAllPartRejections);

// READ BY ID
router.get('/:id', partRejectionController.getPartRejectionById);

// UPDATE
router.put('/:id', partRejectionController.updatePartRejection);

// DELETE
router.delete('/:id', partRejectionController.deletePartRejection);

module.exports = router;
