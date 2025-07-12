const express = require('express');
const router = express.Router();
const productionController = require('../controller/productionController');

router.get('/:machineType', productionController.getAllProductionData);

module.exports = router;
