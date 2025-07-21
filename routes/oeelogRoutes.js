// routes/oeeRoutes.js
// const express = require('express');
// const router  = express.Router();
// const { fetchAndSaveOeeLog } = require('../controller/oeelogController');

// // call live API for that machine and save into oee_log
// router.post('/oeelog/:machine_id', fetchAndSaveOeeLog);

// module.exports = router;



// routes/oeeLogRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/runningtotalvsecpected', async (req, res) => {
  const sql = `
    SELECT
      o.machine_id,
      o.machine_name_type,
      o."TotalPartsProduced",
      o."expectedPartCount",
      p.shift_no,
      DATE(o."createdAt") AS date
    FROM planentry p
    JOIN oee_log o
      ON p.plan_id     = o.plan_id
     AND p.machine_id  = o.machine_id
    WHERE p.status IN ('Running', 'Completed')
      AND o."createdAt" >= date_trunc('day', now());
  `;

  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching today’s running‑plan summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/allproductioncount', async (req, res) => {
  const sql = `
    SELECT
      SUM(o."TotalPartsProduced") AS total_parts_produced
    FROM planentry p
    JOIN oee_log o
      ON p.plan_id    = o.plan_id
     AND p.machine_id = o.machine_id
    WHERE p.status IN ('Running', 'Completed')
      AND o."createdAt" >= date_trunc('day', now())
  `;

  try {
    const { rows } = await pool.query(sql);
    // rows[0].total_parts_produced will be null if no data; coalesce to 0 if you prefer
    res.json({ total_parts_produced: rows[0].total_parts_produced || 0 });
  } catch (err) {
    console.error('Error fetching today’s total production:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/forProductionchart', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        machine_id,
        "TotalPartsProduced",
        "expectedPartCount",
        "shift_no",
        "createdAt"
      FROM oee_log
      ORDER BY id DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching OEE logs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new OEE log entry
router.post('/', async (req, res) => {
  const {
    machine_id, shift_no, plan_id, part_name, machine_name_type,
    TotalPartsProduced, goodPart, defectiveParts,
    availability, performance, quality, OEE,
    expectedPartCount, partBehind, partAhead, idealCycleTime,
    downtimeDuration, runtimeMinutes, machineUtilization,
    operatingTime, remainingTime, elapsedShiftTime,
    createdAt, currentTime
  } = req.body;

  const text = `
    INSERT INTO oee_log (
      machine_id, shift_no, plan_id, part_name, machine_name_type,
      "TotalPartsProduced", "goodPart", "defectiveParts",
      availability, performance, quality, "OEE",
      "expectedPartCount", "partBehind", "partAhead", "idealCycleTime",
      "downtimeDuration", "runtimeMinutes", "machineUtilization",
      "operatingTime", "remainingTime", "elapsedShiftTime",
      "createdAt", "currentTime"
    ) VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,
      $9,$10,$11,$12,
      $13,$14,$15,$16,
      $17,$18,$19,
      $20,$21,$22,$23,
      $24,$25
    ) RETURNING *;
  `;
  const values = [
    machine_id, shift_no, plan_id, part_name, machine_name_type,
    TotalPartsProduced, goodPart, defectiveParts,
    availability, performance, quality, OEE,
    expectedPartCount, partBehind, partAhead, idealCycleTime,
    downtimeDuration, runtimeMinutes, machineUtilization,
    operatingTime, remainingTime, elapsedShiftTime,
    createdAt, currentTime
  ];

  try {
    const { rows } = await pool.query(text, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating OEE log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve all OEE logs
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM oee_log ORDER BY id DESC;');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching OEE logs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve a single OEE log by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM oee_log WHERE id = $1;', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'OEE log not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching OEE log by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing OEE log
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const setClauses = [];
  const values = [];
  let idx = 1;
  for (const [key, val] of Object.entries(updates)) {
    setClauses.push(`"${key}" = $${idx}`);
    values.push(val);
    idx++;
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);
  const query = `
    UPDATE oee_log
    SET ${setClauses.join(', ')}
    WHERE id = $${idx}
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'OEE log not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating OEE log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an OEE log
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM oee_log WHERE id = $1;', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'OEE log not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting OEE log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get("/currentlasttoday/:machine_id", async (req, res) => {
  // const { machine_id } = req.params;
const machine_id = parseInt(req.params.machine_id, 10);
  const sql = `
    SELECT
      COALESCE(SUM("TotalPartsProduced") FILTER (
        WHERE "createdAt" >= date_trunc('day', now())
      ), 0) AS currentDayTotalPartsProduced,
      COALESCE(SUM("TotalPartsProduced") FILTER (
        WHERE "createdAt" >= date_trunc('day', now() - interval '1 day')
          AND "createdAt" <  date_trunc('day', now())
      ), 0) AS lastDayTotalPartsProduced,
      COALESCE(SUM("TotalPartsProduced") FILTER (
        WHERE "createdAt" >= date_trunc('month', now())
      ), 0) AS currentMonthTotalPartsProduced,
      COALESCE(SUM("TotalPartsProduced") FILTER (
        WHERE "createdAt" >= date_trunc('month', now() - interval '1 month')
          AND "createdAt" <  date_trunc('month', now())
      ), 0) AS lastMonthTotalPartsProduced
    FROM oee_log
    WHERE machine_id = $1;
  `;

  try {
    const { rows } = await pool.query(sql, [machine_id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching production stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
})


router.get('/getlatestoeebymachineid/:machineId', async (req, res) => {
  const machineId = parseInt(req.params.machineId, 10);
  if (Number.isNaN(machineId)) {
    return res.status(400).json({ error: 'Invalid machineId parameter' });
  }

  const sql = `
    SELECT
      p.*,
      o.*
    FROM planentry AS p
    JOIN oee_log  AS o
      ON p.plan_id    = o.plan_id
     AND p.machine_id = o.machine_id
    WHERE p.status     = $1
      AND p.machine_id = $2;
  `;

  try {
    const { rows } = await pool.query(sql, ['Running', machineId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No running-plan records found for this machine' });
    }
    res.json(rows);
  } catch (err) {
    console.error(`Error fetching running-plan summary for machine ${machineId}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/allproductioncount', async (req, res) => {
  const sql = `
    SELECT
      SUM(o."TotalPartsProduced") AS total_parts_produced
    FROM planentry p
    JOIN oee_log o
      ON p.plan_id    = o.plan_id
     AND p.machine_id = o.machine_id
    WHERE p.status IN ('Running', 'Completed')
      AND o."createdAt" >= date_trunc('day', now())
  `;

  try {
    const { rows } = await pool.query(sql);
    // rows[0].total_parts_produced will be null if no data; coalesce to 0 if you prefer
    res.json({ total_parts_produced: rows[0].total_parts_produced || 0 });
  } catch (err) {
    console.error('Error fetching today’s total production:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/bottleneck/last7days', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         o.machine_id,
         o.availability,
         o.performance,
         o.quality,
         o.shift_no,
         o."OEE",
         o."createdAt"
       FROM oee_log AS o
       JOIN machine_master AS m
         ON o.machine_id = m.machine_id
       WHERE m.bottleneck   = $1
         AND o."createdAt" >= NOW() - INTERVAL '7 days'
       ORDER BY o."createdAt" DESC`,
      ['bottleneck']
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching bottleneck OEE logs:', error);
    return res.status(500).json({
      message: 'Error fetching bottleneck OEE logs',
      details: error.message
    });
  }
});


router.get('/bottleneck/today/latest', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         o.machine_id,
         o.availability,
         o.performance,
         o.quality,
         o.shift_no,
          o."createdAt",
         o."OEE"
       FROM oee_log AS o
       JOIN machine_master AS m
         ON o.machine_id = m.machine_id
       WHERE m.bottleneck   = $1
         AND o."createdAt" >= date_trunc('day', NOW())
       ORDER BY o."createdAt" DESC
       LIMIT 1`,
      ['bottleneck']
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No OEE record found for today.' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching today’s latest bottleneck OEE record:', error);
    return res.status(500).json({
      message: 'Error fetching today’s latest bottleneck OEE record',
      details: error.message
    });
  }
});




module.exports = router;
