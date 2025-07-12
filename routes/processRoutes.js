// routes/processRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/processController');

router.post('/',     ctrl.createProcess);
router.get('/',     ctrl.getAllProcesses);
router.get('/:id', ctrl.getProcessById);
router.put('/:id', ctrl.updateProcess);
router.delete('/:id', ctrl.deleteProcess);

module.exports = router;
