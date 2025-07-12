const express = require("express");
const router = express.Router();
const alertController = require("../controller/alertsController");

// router.post("/", alertController.createAlert);
router.get("/", alertController.getAllAlerts);
router.get("/:id", alertController.getAlertById);
// router.put("/:id", alertController.updateAlert);
// router.delete("/:id", alertController.deleteAlert);

module.exports = router;
