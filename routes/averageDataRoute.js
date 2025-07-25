// routes/averageDataRoute.js

const express = require("express");
const router = express.Router();
const { getMachineAverageData } = require("../controller/averageDataController");

// Route to get average data for bottleneck machines
router.get("/", getMachineAverageData);

module.exports = router;
