const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const pool = require("../db"); // PostgreSQL pool
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:5003/api/production/getRunning"
    );
    const machineDataList = response.data;

    const results = [];

    for (const machine of machineDataList) {
      const {
        machine_id,
        plan_id,
        shift_no,
        createdAt,
        TotalPartsProduced,
        cycle_time,
        load_unload,
      } = machine;

      const currentTime = moment.tz("Asia/Kolkata");
      const startTime = moment(createdAt).tz("Asia/Kolkata");
      let elapsedShiftTime = currentTime.diff(startTime, "minutes");
      if (elapsedShiftTime <= 0) elapsedShiftTime = 1; // fallback

      // 1. Defective parts
      const rejectionQuery = await pool.query(
        `SELECT SUM(quantity) AS rejected FROM partrejection
         WHERE "machine_id" = $1 AND "shift_no" = $2 AND "date"::date = CURRENT_DATE`,
        [machine_id, shift_no]
      );
      const defectiveParts = parseInt(rejectionQuery.rows[0]?.rejected || 0);
      console.log(
        `Machine ${machine_id}: Start=${startTime.format()}, Now=${currentTime.format()}, Elapsed=${elapsedShiftTime} mins`
      );

      // 2. Downtime
      const downtimeQuery = await pool.query(
        `SELECT COALESCE(SUM(duration), 0) AS downtime
         FROM downtime
         WHERE "machine_id" = $1 AND "shift_no" = $2 AND "start_timestamp"::date = CURRENT_DATE`,
        [machine_id, shift_no]
      );
      const downtimeDuration = parseFloat(downtimeQuery.rows[0]?.downtime || 0);

      // 3. Calculate
      const CycleTime = parseFloat(cycle_time || 0);
      const LoadUnLoad = parseFloat(load_unload || 0);
      const idealCycleTime = (CycleTime + LoadUnLoad) / 60;

      const goodPart = TotalPartsProduced - defectiveParts;
      const operatingTime = Math.max(0, elapsedShiftTime - downtimeDuration);

      const availability =
        elapsedShiftTime > 0 ? (operatingTime / elapsedShiftTime) * 100 : 0;
      const performance =
        elapsedShiftTime > 0
          ? ((idealCycleTime * TotalPartsProduced) / elapsedShiftTime) * 100
          : 0;
      const quality =
        TotalPartsProduced > 0 ? (goodPart / TotalPartsProduced) * 100 : 0;
      const OEE = (availability * performance * quality) / 10000;

      const expectedPartCount =
        idealCycleTime > 0 ? Math.floor(elapsedShiftTime / idealCycleTime) : 0;
      const partBehind = expectedPartCount - TotalPartsProduced;
      const machineUtilization =
        expectedPartCount > 0 ? (goodPart / expectedPartCount) * 100 : 0;

      results.push({
        machine_id,
        machine_name_type: machine.machine_name_type,
        shift_no,
        plan_id,
        TotalPartsProduced,
        goodPart,
        defectiveParts,
        downtimeDuration,
        idealCycleTime: idealCycleTime.toFixed(2),
        runtimeMinutes: elapsedShiftTime,
        operatingTime: operatingTime.toFixed(2),
        availability: availability.toFixed(2),
        performance: performance.toFixed(2),
        quality: quality.toFixed(2),
        OEE: OEE.toFixed(4),
        expectedPartCount,
        partBehind,
        machineUtilization: machineUtilization.toFixed(2),
        createdAt,
        currentTime: currentTime.format(),
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Error in getRunningOEE:", err);
    res
      .status(500)
      .json({ error: "Failed to compute OEE data", details: err.message });
  }
});

router.get("/live/:machine_id", async (req, res) => {
  const { machine_id } = req.params;

  try {
    // Fetch machine info (for org or validation)
    const machineQuery = await pool.query(
      `SELECT * FROM machine_master WHERE machine_id = $1`,
      [machine_id]
    );
    const machineData = machineQuery.rows[0];
    if (!machineData)
      return res.status(404).json({ message: "Machine not found." });

    const orgId = "ORG001"; // You can use machineData.organization_id if available

    // Fetch all running data
    const response = await axios.get(
      `http://localhost:5003/api/production/getRunning`
    );
    const machineEntry = response.data.find(
      (m) => m.machine_id === parseInt(machine_id)
    );

    if (!machineEntry)
      return res.status(404).json({ message: "Machine not running." });

    const {
      plan_id,
      part_name,
      machine_name_type,
      shift_no,
      TotalPartsProduced,
      createdAt,
      cycle_time,
      updated_at,
      load_unload,
    } = machineEntry;
    console.log("Machine Entry:", machineEntry);
    const currentTime = moment.tz("Asia/Kolkata");
    const startTime = moment.tz(updated_at, "Asia/Kolkata");
    const elapsedShiftTime = currentTime.diff(startTime, "minutes");

    const rejectionQuery = await pool.query(
      `SELECT SUM(quantity) AS rejected FROM partrejection WHERE machine_id = $1 AND shift_no = $2 AND date = CURRENT_DATE`,
      [machine_id, shift_no]
    );
    const defectiveParts = parseInt(rejectionQuery.rows[0]?.rejected || 0);

    const downtimeQuery = await pool.query(
      `SELECT COALESCE(SUM(duration), 0) AS downtime FROM downtime WHERE machine_id = $1 AND shift_no = $2 AND start_timestamp::date = CURRENT_DATE`,
      [machine_id, shift_no]
    );
    const downtimeDuration = parseFloat(downtimeQuery.rows[0]?.downtime || 0);

    const CycleTime = parseFloat(cycle_time || 0);
    const LoadUnLoad = parseFloat(load_unload || 0);
    const idealCycleTime = (CycleTime + LoadUnLoad) / 60;
    console.log(
      "cycletime",
      idealCycleTime,
      "loadunload",
      LoadUnLoad,
      "cycle_time"
    );

    const goodPart = TotalPartsProduced - defectiveParts;
    const operatingTime = elapsedShiftTime - downtimeDuration;

    const availability =
      elapsedShiftTime > 0 ? (operatingTime / elapsedShiftTime) * 100 : 0;
    const performance =
      elapsedShiftTime > 0
        ? ((idealCycleTime * TotalPartsProduced) / elapsedShiftTime) * 100
        : 0;
    const quality =
      TotalPartsProduced > 0 ? (goodPart / TotalPartsProduced) * 100 : 0;
    const OEE = (availability * performance * quality) / 10000;

    const expectedPartCount =
      idealCycleTime > 0 ? Math.floor(elapsedShiftTime / idealCycleTime) : 0;
    const partBehind = expectedPartCount - TotalPartsProduced;
    const partAhead = TotalPartsProduced - expectedPartCount;
    const machineUtilization =
      expectedPartCount > 0 ? (goodPart / expectedPartCount) * 100 : 0;

    const remainingTimeMs = currentTime - startTime;
    const remainingHours = Math.floor(remainingTimeMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor(
      (remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    return res.json({
      machine_id,
      shift_no,
      plan_id,
      part_name,
      machine_name_type,
      TotalPartsProduced,
      goodPart,
      defectiveParts,
      availability: availability.toFixed(2),
      performance: performance.toFixed(2),
      quality: quality.toFixed(2),
      OEE: OEE.toFixed(4),
      expectedPartCount,
      partBehind,
      partAhead,
      idealCycleTime,
      downtimeDuration,
      runtimeMinutes: elapsedShiftTime,
      machineUtilization: machineUtilization.toFixed(2),
      operatingTime: operatingTime.toFixed(2),
      remainingTime: { hours: remainingHours, minutes: remainingMinutes },
      elapsedShiftTime: elapsedShiftTime,
      createdAt: startTime.format(),
      currentTime: currentTime.format(),
    });
  } catch (err) {
    console.error("OEE LiveV2 Error:", err.message);
    res
      .status(500)
      .json({ error: "Live OEE calc failed", details: err.message });
  }
});

module.exports = router;
