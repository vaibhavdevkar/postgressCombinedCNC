const pool = require('../db');

/**
 * GET today’s machine_status records for machines flagged as bottleneck.
 */
// exports.getTodayBottleneckMachineStatus = async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       `SELECT ms.*
//          FROM public.machine_status AS ms
//          JOIN public.machine_master  AS m
//            ON ms.machine_id = m.machine_id
//         WHERE m.bottleneck = $1
//           AND ms.created_at >= date_trunc('day', NOW())
//           AND ms.created_at <  date_trunc('day', NOW()) + INTERVAL '1 day'
//         ORDER BY ms.id DESC`,
//       ['bottleneck']
//     );
//     return res.status(200).json(rows);
//   } catch (error) {
//     console.error('Error fetching today’s bottleneck machine status:', error);
//     return res.status(500).json({
//       message: 'Error fetching today’s bottleneck machine status',
//       details: error.message
//     });
//   }
// };


exports.getTodayBottleneckMachineStatus = async (req, res) => {
  try {
    // fetch today’s raw status records for bottleneck machines
    const { rows } = await pool.query(
      `SELECT ms.machine_id, ms.is_available, ms.created_at
         FROM public.machine_status AS ms
         JOIN public.machine_master  AS m
           ON ms.machine_id = m.machine_id
        WHERE m.bottleneck     = $1
          AND ms.created_at   >= date_trunc('day', NOW())
          AND ms.created_at   <  date_trunc('day', NOW()) + INTERVAL '1 day'
        ORDER BY ms.created_at ASC`,
      ['bottleneck']
    );

    // if fewer than 2 records, no spans to measure
    if (rows.length < 2) {
      return res.status(200).json({ DownTime: 0, RunTime: 0 });
    }

    let runTimeMs = 0;
    let downTimeMs = 0;

    // iterate pairs of consecutive records
    for (let i = 0; i < rows.length - 1; i++) {
      const curr = rows[i];
      const next = rows[i + 1];
      const deltaMs = new Date(next.created_at) - new Date(curr.created_at);

      if (curr.is_available) {
        runTimeMs += deltaMs;
      } else {
        downTimeMs += deltaMs;
      }
    }

    // convert ms → minutes and round
    const RunTime  = Math.round(runTimeMs  / 60000);
    const DownTime = Math.round(downTimeMs / 60000);

    return res.status(200).json({ DownTime, RunTime });
  } catch (error) {
    console.error('Error fetching downtime/runtime summary:', error);
    return res.status(500).json({
      message: 'Error fetching downtime/runtime summary',
      details: error.message
    });
  }
};