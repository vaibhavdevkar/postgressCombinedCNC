const express = require('express');
const router = express.Router();
const breakdownController = require('../controller/breakdownController');

router.post('/', breakdownController.createBreakdown);
router.get('/', breakdownController.getAllBreakdowns);
router.get('/:id', breakdownController.getBreakdownById);
router.put('/:id', breakdownController.updateBreakdown);
router.delete('/:id', breakdownController.deleteBreakdown);

module.exports = router;
