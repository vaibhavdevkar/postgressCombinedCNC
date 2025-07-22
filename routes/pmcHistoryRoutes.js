// const express = require("express");
// const router = express.Router();
// const pmcHistoryController = require("../controller/pmcHistoryController");

// // Create
// router.post("/", pmcHistoryController.createHistory);

// // Read all
// router.get("/", pmcHistoryController.getAllHistory);

// // Read by ID
// router.get("/:id", pmcHistoryController.getHistoryById);

// // Update
// router.put("/:id", pmcHistoryController.updateHistory);

// // Delete
// router.delete("/:id", pmcHistoryController.deleteHistory);

// module.exports = router;


// routes/pmcHistoryRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/pmcHistoryController');

router.get('/with-parameter', ctrl.getAllWithParameterName);
router.get('/history', ctrl.getalldataforhistory);

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);



module.exports = router;
