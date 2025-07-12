// 3. routes/shiftRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/shiftController');

router.post('/', ctrl.createShift);
router.get('/', ctrl.getAllShifts);
router.get('/:id', ctrl.getShiftById);
router.put('/:id', ctrl.updateShift);
router.delete('/:id', ctrl.deleteShift);

module.exports = router;
