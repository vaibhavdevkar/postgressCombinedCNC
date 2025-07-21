const pool = require('../db');

// // CREATE
// exports.createDowntime = async (req, res) => {
//   try {
//     const {
//       machine_id, shift_no, start_timestamp, end_timestamp,
//       downtime_reason, duration, status, category,
//       linked, remark, date, plan_id, operator_id
//     } = req.body;

//     const result = await pool.query(
//       `INSERT INTO downtime (
//         machine_id, shift_no, start_timestamp, end_timestamp,
//         downtime_reason, duration, status, category,
//         linked, remark, date, plan_id, operator_id
//       ) VALUES (
//         $1, $2, $3, $4,
//         $5, $6, $7, $8,
//         $9, $10, $11, $12, $13
//       ) RETURNING *`,
//       [
//         machine_id, shift_no, start_timestamp, end_timestamp,
//         downtime_reason, duration, status || false, category,
//         linked, remark || '', date || new Date(), plan_id, operator_id
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating downtime', error: error.message });
//   }
// };

// READ ALL
// exports.getAllDowntimes = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM downtime ORDER BY start_timestamp DESC');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching downtimes', error: error.message });
//   }
// };

exports.getAllDowntimes = async (req, res) => {
  const sql = `
    SELECT
      dt.*,
      mm.machine_name_type
    FROM public.downtime AS dt
    LEFT JOIN public.machine_master AS mm
      ON dt.machine_id = mm.machine_id
    ORDER BY dt.start_timestamp DESC
  `;

  try {
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching downtimes with machine names', error);
    res.status(500).json({
      message: 'Error fetching downtimes',
      error: error.message
    });
  }
};

// READ BY ID
exports.getDowntimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM downtime WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Downtime not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching downtime', error: error.message });
  }
};

// UPDATE
exports.updateDowntime = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `UPDATE downtime SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Downtime not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating downtime', error: error.message });
  }
};

// DELETE
exports.deleteDowntime = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM downtime WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Downtime not found' });
    }

    res.json({ message: 'Downtime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting downtime', error: error.message });
  }
};



// exports.getDowntimeByMachine = async (req, res) => {
//   const rawId = req.params.machine_id;
//   const machineId = parseInt(rawId, 10);

//   if (isNaN(machineId)) {
//     return res
//       .status(400)
//       .json({ message: 'Invalid machine_id parameter' });
//   }

//   try {
//     const { rows } = await pool.query(
//       `
//       SELECT
//         d.id,
//         d.machine_id,
//         d.shift_no,
//         d.start_timestamp,
//         d.end_timestamp,
//         d.downtime_reason,
//         d.duration,
//         d.status   AS downtime_status,
//         d.category,
//         d.linked,
//         d.remark,
//         d.date     AS downtime_date,
//         d.plan_id,
//         d.operator_id,
//         p.part_name,
//         p.status   AS plan_status
//       FROM public.downtime AS d
//       JOIN public.planentry AS p
//         ON d.plan_id = p.plan_id
//       WHERE p.status     = 'Running'
//         AND d.machine_id = $1
//       ORDER BY d.id ASC
//       `,
//       [machineId]
//     );

//     return res.status(200).json(rows);
//   } catch (err) {
//     console.error('Error fetching downtime records:', err);
//     return res
//       .status(500)
//       .json({ message: 'Error fetching downtime records', details: err.message });
//   }
// };


exports.getDowntimeByMachine = async (req, res) => {
  const machineId = parseInt(req.params.machine_id, 10);
  if (isNaN(machineId)) {
    return res.status(400).json({ error: 'machine_id must be a number' });
  }

  const sql = `
    SELECT *
    FROM public.downtime
    WHERE machine_id = $1
    ORDER BY start_timestamp DESC
  `;

  try {
    const { rows } = await pool.query(sql, [machineId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching downtimes for machine', machineId, err);
    res.status(500).json({
      message: 'Error fetching downtimes',
      error: err.message
    });
  }
};

exports.getDowntimeByMachinebyRunning = async (req, res) => {
  const { machineId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT d.*
         FROM downtime AS d
         JOIN planentry AS p
           ON d.plan_id = p.plan_id
        WHERE p.machine_id = $1
        ORDER BY d.id DESC`,
      [machineId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching downtime for machine via planentry:', error);
    return res.status(500).json({
      message: 'Error fetching downtime records',
      details: error.message
    });
  }
};