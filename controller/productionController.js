const pool = require('../db');
const moment = require('moment-timezone');

exports.getAllProductionData = async (req, res) => {
  const { machineType } = req.params;
  const tableName = `ORG001_${machineType}_productionData`;

  try {
    const result = await pool.query(`SELECT * FROM "${tableName}" ORDER BY "createdAt" DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching production data', error: error.message });
  }
};



// exports.getRunningPlans = async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       `SELECT *
//          FROM public.planentry
//         WHERE status = $1`,
//       ['Running']
//     );
//     return res.status(200).json(rows);
//   } catch (error) {
//     console.error('Error fetching running plans:', error);
//     return res
//       .status(500)
//       .json({
//         message: 'Error fetching running plans',
//         details: error.message
//       });
//   }
// };


// exports.getLatestProductionForRunningPlan = async (req, res) => {
//   try {
//     // 1) Get the most recent Running plan entry
//     const planRes = await pool.query(
//       `SELECT machine_id
//          FROM public.planentry
//         WHERE status = $1
//      ORDER BY created_at DESC
//         LIMIT 1`,
//       ['Running']
//     );
//     if (planRes.rows.length === 0) {
//       return res.status(404).json({ message: 'No running plans found' });
//     }
//     const { machine_id } = planRes.rows[0];

//     // 2) Lookup machine_name_type for that machine_id
//     const machRes = await pool.query(
//       `SELECT machine_name_type
//          FROM public.machine_master
//         WHERE machine_id = $1`,
//       [machine_id]
//     );
//     if (machRes.rows.length === 0) {
//       return res.status(404).json({ message: 'Machine not found' });
//     }
//     const machineType = machRes.rows[0].machine_name_type;

//     // 3) Build dynamic production table name
//     const prodTable = `ORG001_${machineType}_productionData`;

//     // 4) Fetch the single latest production record
//     const prodRes = await pool.query(
//       `
//       SELECT
//         machine_name_type,
//         "EmpId",
//         "createdAt"       AS prod_createdAt,
//         "TotalPartsProduced",
//         shift_no          AS prod_shift_no,
//         actualCount_machine,
//         plan_id           AS prod_plan_id
//       FROM "${prodTable}"
//       WHERE machine_id = $1
//       ORDER BY "createdAt" DESC
//       LIMIT 1
//       `,
//       [machine_id]
//     );
//     if (prodRes.rows.length === 0) {
//       return res.status(404).json({ message: 'No production data for machine' });
//     }

//     // 5) Return only that production record
//     return res.status(200).json(prodRes.rows[0]);

//   } catch (error) {
//     console.error('Error fetching latest production record:', error);
//     return res
//       .status(500)
//       .json({
//         message: 'Error fetching latest production record',
//         details: error.message
//       });
//   }
// };






// // controllers/productionController.js
// exports.getLatestProductionByMachineType = async (req, res) => {
//   try {
//     // 1) find all distinct machine types for Active machines with Running plans
//     const { rows: machines } = await pool.query(
//       `
//       SELECT DISTINCT mm.machine_name_type
//         FROM public.planentry AS pe
//         JOIN public.machine_master AS mm
//           ON pe.machine_id = mm.machine_id
//        WHERE mm.status = $1
//          AND pe.status = $2
//       `,
//       ['Active', 'Running']
//     );

//     // 2) for each machineType, fetch only its latest production record
//     const results = await Promise.all(
//       machines.map(async ({ machine_name_type }) => {
//         const tableName = `ORG001_${machine_name_type}_productionData`;

//         const { rows } = await pool.query(
//           `
//           SELECT
//             machine_id,
//             machine_name_type,
//             "EmpId",
//             "createdAt",
//             "TotalPartsProduced",
//             shift_no,
//             "actualCount_machine",
//             plan_id
//           FROM "${tableName}"
//           ORDER BY "createdAt" DESC
//           LIMIT 1
//           `
//         );

//         if (!rows.length) return null;
//         // return the raw row (keys identical to column names)
//         return rows[0];
//       })
//     );

//     // drop any nulls (in case a table had no rows)
//     const latestByType = results.filter(r => r);

//     return res.status(200).json(latestByType);
//   } catch (error) {
//     console.error('Error fetching latest production records:', error);
//     return res.status(500).json({
//       message: 'Error fetching latest production records',
//       details: error.message
//     });
//   }
// };


// exports.getLatestProductionByMachineType = async (req, res) => {
//   try {
//     // 1) find all distinct machine types for Active machines with Running plans
//     const { rows: machines } = await pool.query(
//       `
//       SELECT DISTINCT mm.machine_name_type
//         FROM public.planentry AS pe
//         JOIN public.machine_master AS mm
//           ON pe.machine_id = mm.machine_id
//        WHERE mm.status = $1
//          AND pe.status = $2
//       `,
//       ['Active', 'Running']
//     );

//     // 2) for each machineType, fetch its latest production record + part_name
//     const results = await Promise.all(
//       machines.map(async ({ machine_name_type }) => {
//         const tableName = `ORG001_${machine_name_type}_productionData`;

//         const { rows } = await pool.query(
//           `
//           SELECT
//             pd.machine_id,
//             pd.machine_name_type,
//             pd."EmpId",
//             pd."createdAt",
//             pd."TotalPartsProduced",
//             pd.shift_no,
//             pd."actualCount_machine",
//             pd.plan_id,
//             pe.part_name,
//             pe.updated_at,
//             pe.load_unload,
//             pe.cycle_time
//           FROM "${tableName}" AS pd
//           LEFT JOIN public.planentry AS pe
//             ON pd.plan_id = pe.plan_id
//           ORDER BY pd."createdAt" DESC
//           LIMIT 1
//           `
//         );

//         // if table is empty, skip
//         return rows[0] || null;
//       })
//     );

//     // drop any nulls (in case some tables had no rows)
//     const latestByType = results.filter(r => r);

//     return res.status(200).json(latestByType);
//   } catch (error) {
//     console.error('Error fetching latest production records:', error);
//     return res.status(500).json({
//       message: 'Error fetching latest production records',
//       details: error.message
//     });
//   }
// };

exports.getLatestProductionByMachineType = async (req, res) => {
  try {
    // 1) find all distinct machine types for Active machines with Running plans
    const { rows: machines } = await pool.query(
      `
      SELECT DISTINCT mm.machine_name_type
        FROM public.planentry AS pe
        JOIN public.machine_master AS mm
          ON pe.machine_id = mm.machine_id
       WHERE mm.status = $1
         AND pe.status = $2
      `,
      ['Active', 'Running']
    );

    // 2) for each machineType, fetch its latest production record + part_name + IST updated_at
    const results = await Promise.all(
      machines.map(async ({ machine_name_type }) => {
        const tableName = `ORG001_${machine_name_type}_productionData`;

        const { rows } = await pool.query(
          `
          SELECT
            pd.machine_id,
            pd.machine_name_type,
            pd."EmpId",
            pd."createdAt",
            pd."TotalPartsProduced",
            pd.shift_no,
            pd."actualCount_machine",
            pd.plan_id,
            pe.part_name,
            -- formatted IST timestamp, no offset suffix
            to_char(
              pe.updated_at AT TIME ZONE 'Asia/Kolkata',
              'YYYY-MM-DD"T"HH24:MI:SS.US'
            ) AS updated_at,
            pe.load_unload,
            pe.cycle_time
          FROM "${tableName}" AS pd
          LEFT JOIN public.planentry AS pe
            ON pd.plan_id = pe.plan_id
          ORDER BY pd."createdAt" DESC
          LIMIT 1
          `
        );

        return rows[0] || null;
      })
    );

    const latestByType = results.filter(r => r);
    return res.status(200).json(latestByType);
  } catch (error) {
    console.error('Error fetching latest production records:', error);
    return res.status(500).json({
      message: 'Error fetching latest production records',
      details: error.message
    });
  }
};


exports.getAllProductionByMachineTypeHourly = async (req, res) => {
  try {
    // 1) Validate machineId
    const machineId = parseInt(req.params.machineId, 10);
    if (isNaN(machineId)) {
      return res.status(400).json({ message: 'Invalid machineId' });
    }

    // 2) Lookup machine_name_type
    const { rows: masterRows } = await pool.query(
      `SELECT machine_name_type
         FROM public.machine_master
        WHERE machine_id = $1`,
      [machineId]
    );
    if (masterRows.length === 0) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    const { machine_name_type } = masterRows[0];
    const tableName = `ORG001_${machine_name_type}_productionData`;

    // 3) Fetch all “Running” records, oldest first
    const { rows } = await pool.query(
      `
      SELECT
        pd."createdAt" AS ts,
        pd."TotalPartsProduced"::bigint AS count
      FROM "${tableName}" pd
      JOIN public.planentry pe
        ON pd.plan_id = pe.plan_id
       AND pe.status = 'Running'
      WHERE pd.machine_id = $1
      ORDER BY pd."createdAt" ASC
      `,
      [machineId]
    );

    if (rows.length < 2) {
      // need at least two points to compute a difference
      return res.status(200).json([]);
    }

    // 4) Convert to moment objects in IST
    const recs = rows.map(r => ({
      ts: moment(r.ts).tz('Asia/Kolkata'),
      count: Number(r.count)
    }));

    const diffs = [];
    let startIndex = 0;

    // 5) Loop, each time finding the “hour‑later” record
    while (true) {
      const startRec = recs[startIndex];
      const targetTime = startRec.ts.clone().add(1, 'hour');

      // find the last record with ts <= targetTime
      let candidateIndex = null;
      for (let j = startIndex + 1; j < recs.length; j++) {
        if (recs[j].ts.isSameOrBefore(targetTime)) {
          candidateIndex = j;
        } else {
          break;
        }
      }

      if (candidateIndex === null) {
        // no more one‑hour steps available
        break;
      }

      const endRec = recs[candidateIndex];
      diffs.push({
        from: startRec.ts.format('YYYY-MM-DDTHH:mm:ss'),
        to:   endRec.ts.format('YYYY-MM-DDTHH:mm:ss'),
        produced: endRec.count - startRec.count
      });

      // advance
      startIndex = candidateIndex;

      // if there's not even enough data to step another hour, exit
      if (startIndex + 1 >= recs.length) {
        break;
      }
    }

    return res.status(200).json(diffs);
  } catch (error) {
    console.error('Error fetching hourly‑sequential production:', error);
    return res.status(500).json({
      message: 'Error fetching production data',
      details: error.message
    });
  }
};

// exports.getAvgCycleTimeLast7Days = async (req, res) => {
//   const { machineType } = req.params;
//   const tableName = `ORG001_${machineType}_productionData`;

//   const query = `
//     SELECT
//       DATE_TRUNC('day', h."createdAt")::date     AS day,
//       h."plan_id",
//       pe.part_id,
//       ROUND(AVG(h."production_CycleTime")::numeric, 2) AS avgCycleTime
//     FROM "${tableName}" AS h
//     JOIN public.planentry AS pe
//       ON h."plan_id" = pe.plan_id
//     WHERE h."createdAt" >= NOW() - INTERVAL '7 days'
//     GROUP BY day, h."plan_id", pe.part_id
//     ORDER BY day DESC, h."plan_id";
//   `;

//   try {
//     const { rows } = await pool.query(query);
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching 7‑day avg cycle times with part_id:', err);
//     res.status(500).json({
//       message: 'Failed to fetch average cycle times for the last 7 days',
//       error: err.message
//     });
//   }
// };


// controllers/productionDataController.js



exports.getAvgCycleTimeLast7Days = async (req, res) => {
  try {
    // 1. Find the bottleneck machine by matching the column value
    const bottleneckQ = `
      SELECT machine_name_type
      FROM public.machine_master
      WHERE bottleneck = 'bottleneck'
      LIMIT 1;
    `;
    const bottleneckRes = await pool.query(bottleneckQ);

    if (bottleneckRes.rows.length === 0) {
      return res.status(404).json({ message: 'No bottleneck machine found' });
    }

    const machineType = bottleneckRes.rows[0].machine_name_type;
    const tableName = `ORG001_${machineType}_productionData`;

    // 2. Aggregate the last‑7‑day averages
    const dataQ = `
      SELECT
        DATE_TRUNC('day', h."createdAt")::date      AS day,
        h."plan_id",
        pe.part_id,
        pm."cycle_time"                            AS processCycleTime,
        ROUND(AVG(h."production_CycleTime")::numeric, 2) AS avgCycleTime
      FROM "${tableName}" AS h
      INNER JOIN public.planentry       AS pe
        ON h."plan_id" = pe.plan_id
      INNER JOIN public.process_master AS pm
        ON pe.part_id = pm.part_id
      WHERE h."createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY day, h."plan_id", pe.part_id, pm."cycle_time"
      ORDER BY day DESC, h."plan_id";
    `;

    const { rows } = await pool.query(dataQ);
    res.json({
      machineType,
      data: rows
    });
  } catch (err) {
    console.error('Error in getAvgCycleTimeLast7Days:', err);
    res.status(500).json({
      message: 'Failed to fetch average cycle times',
      error: err.message
    });
  }
};
