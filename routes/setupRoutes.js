const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/setupController');


router.get(
  '/parameters/:machine_id/:part_id',
  ctrl.getSetupsByMachineAndPart
);


router.post('/setups',     ctrl.createSetup);
router.get('/setups',     ctrl.getAllSetups);
router.get('/setups/:id', ctrl.getSetupById);
router.put('/setups/:id', ctrl.updateSetup);
router.delete('/setups/:id', ctrl.deleteSetup);

module.exports = router;
