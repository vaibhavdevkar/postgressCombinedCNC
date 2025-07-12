const express = require("express");
const router = express.Router();
const alertHistoryController = require("../controller/alertHistoryController");

// router.post("/", alertHistoryController.createAlertHistory);
router.get("/", alertHistoryController.getAllAlertHistories);
router.get("/:id", alertHistoryController.getAlertHistoryById);
// router.put("/:id", alertHistoryController.updateAlertHistory);
// router.delete("/:id", alertHistoryController.deleteAlertHistory);

module.exports = router;
