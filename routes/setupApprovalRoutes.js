const express = require('express');
const router = express.Router();
const controller = require('../controller/setupApprovalController');

// Routes
router.post('/', controller.createSetupApproval);
router.get('/', controller.getAllSetupApprovals);
router.get('/:id', controller.getSetupApprovalById);
router.put('/:id', controller.updateSetupApproval);
router.delete('/:id', controller.deleteSetupApproval);

module.exports = router;