// controllers/oeeController.js
const axios = require('axios');
const pool  = require('../db');  // your configured pg Pool instance

// API endpoints
const MACHINES_API = 'http://localhost:5003/api/machines/allactivecount';
const PLAN_API     = 'http://localhost:5003/api/planentries/running';
const OEE_LIVE_API = 'http://192.168.1.11:5003/api/oee/live';

async function iterateAll() {
  try {
    // 1) Fetch all active machine IDs
    const { data: machineIds } = await axios.get(MACHINES_API);

    // 2) For each machine, try to fetch its running plan
    for (const machine_id of machineIds) {
      let plans;
      try {
        const planRes = await axios.get(`${PLAN_API}/${machine_id}`);
        plans = planRes.data;
      } catch (err) {
        // If we get a 404 (no running plans), skip this machine
        if (err.response?.status === 404) {
          continue;
        }
        // Other errors should surface so you can see them
        throw err;
      }

      // Skip machines with no plans or plans not in Running status
      if (!plans.length || plans[0].status !== 'Running') {
        continue;
      }

      // 3) Fetch live‐OEE data for this machine
      const { data: oee } = await axios.get(`${OEE_LIVE_API}/${machine_id}`);

      // 4) Map fields into an array matching your INSERT/UPDATE placeholders
      const vals = [
        parseInt(oee.machine_id, 10),    // $1
        oee.shift_no,                    // $2
        oee.plan_id,                     // $3
        oee.part_name,                   // $4
        oee.machine_name_type,           // $5
        oee.TotalPartsProduced,          // $6
        oee.goodPart,                    // $7
        oee.defectiveParts,              // $8
        oee.availability,                // $9
        oee.performance,                 // $10
        oee.quality,                     // $11
        oee.OEE,                         // $12
        oee.expectedPartCount,           // $13
        oee.partBehind,                  // $14
        oee.partAhead,                   // $15
        oee.idealCycleTime,              // $16
        oee.downtimeDuration,            // $17
        oee.runtimeMinutes,              // $18
        oee.machineUtilization,          // $19
        oee.operatingTime,               // $20
        JSON.stringify(oee.remainingTime),// $21
        oee.elapsedShiftTime,            // $22
        oee.createdAt,                   // $23
        oee.currentTime                  // $24
      ];

      // 5) Upsert logic keyed on plan_id
      const { rowCount } = await pool.query(
        `SELECT 1 FROM oee_log WHERE "plan_id" = $1`,
        [oee.plan_id]
      );

      if (rowCount) {
        // UPDATE existing row
        await pool.query(
          `UPDATE oee_log SET
             "machine_id"        = $1,
             "shift_no"          = $2,
             "part_name"         = $4,
             "machine_name_type" = $5,
             "TotalPartsProduced"= $6,
             "goodPart"          = $7,
             "defectiveParts"    = $8,
             "availability"      = $9,
             "performance"       = $10,
             "quality"           = $11,
             "OEE"               = $12,
             "expectedPartCount" = $13,
             "partBehind"        = $14,
             "partAhead"         = $15,
             "idealCycleTime"    = $16,
             "downtimeDuration"  = $17,
             "runtimeMinutes"    = $18,
             "machineUtilization"= $19,
             "operatingTime"     = $20,
             "remainingTime"     = $21,
             "elapsedShiftTime"  = $22,
             "createdAt"         = $23,
             "currentTime"       = $24
           WHERE "plan_id" = $3`,
          vals
        );
      } else {
        // INSERT new row
        await pool.query(
          `INSERT INTO oee_log (
             "machine_id","shift_no","plan_id","part_name","machine_name_type",
             "TotalPartsProduced","goodPart","defectiveParts",
             "availability","performance","quality","OEE",
             "expectedPartCount","partBehind","partAhead",
             "idealCycleTime","downtimeDuration","runtimeMinutes",
             "machineUtilization","operatingTime","remainingTime",
             "elapsedShiftTime","createdAt","currentTime"
           ) VALUES (
             $1,$2,$3,$4,$5,
             $6,$7,$8,
             $9,$10,$11,$12,
             $13,$14,$15,
             $16,$17,$18,
             $19,$20,$21,
             $22,$23,$24
           )`,
          vals
        );
      }
    }
  }
  catch (err) {
    // Log but do not clearInterval – we want the poller to continue running
    console.error('Error in global OEE poll iteration:', err);
  }
}

// Starts the polling loop
function startGlobalOeePoller() {
  // 1) Run immediately
  iterateAll();
  // 2) Schedule to run every 60 seconds, forever
  setInterval(iterateAll, 60 * 1000);
}

module.exports = { startGlobalOeePoller };
