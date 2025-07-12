const express = require("express");
const router = express.Router();
const pmcHistoryController = require("../controller/pmcHistoryController");

// Create
router.post("/", pmcHistoryController.createHistory);

// Read all
router.get("/", pmcHistoryController.getAllHistory);

// Read by ID
router.get("/:id", pmcHistoryController.getHistoryById);

// Update
router.put("/:id", pmcHistoryController.updateHistory);

// Delete
router.delete("/:id", pmcHistoryController.deleteHistory);

module.exports = router;
