const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/pmcParameterController');


router.get('/bymachineid/:machine_id', ctrl.getPmcParametersByMachine);


router.post('/', ctrl.createPmcParameter);
router.get('/', ctrl.getAllPmcParameters);
router.get('/:id', ctrl.getPmcParameterById);
router.put('/:id', ctrl.updatePmcParameter);
router.delete('/:id', ctrl.deletePmcParameter);

module.exports = router;
