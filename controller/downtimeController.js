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
exports.getAllDowntimes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM downtime ORDER BY start_timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching downtimes', error: error.message });
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
