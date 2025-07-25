const pool = require('../db');

// CREATE
exports.createBreakdown = async (req, res) => {
  try {
    const {
      machine_id, breakdown_reason, breakdown_start, breakdown_end, assigned_technician,
      remark, shift_no, breakdown_type, action_taken, root_cause, responsibility,
      status, location, date
    } = req.body;

    const result = await pool.query(`
      INSERT INTO breakdown (
        machine_id, breakdown_reason, breakdown_start, breakdown_end, assigned_technician,
        remark, shift_no, breakdown_type, action_taken, root_cause, responsibility,
        status, location,date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        machine_id, breakdown_reason, breakdown_start, breakdown_end, assigned_technician,
        remark, shift_no, breakdown_type, action_taken, root_cause, responsibility,
        status, location, date
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating breakdown', error: error.message });
  }
};

// READ ALL
// exports.getAllBreakdowns = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM breakdown ORDER BY date DESC');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching breakdowns', error: error.message });
//   }
// };

exports.getAllBreakdowns = async (req, res) => {
  const sql = `
    SELECT
      b.*, 
      m.machine_name_type
    FROM breakdown AS b
    JOIN machine_master AS m
      ON b.machine_id = m.machine_id
    ORDER BY b.date DESC;
  `;

  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching breakdowns:', error);
    res.status(500).json({
      message: 'Error fetching breakdowns',
      error: error.message
    });
  }
};

// READ BY ID
exports.getBreakdownById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM breakdown WHERE breakdown_id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Breakdown not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching breakdown', error: error.message });
  }
};

// UPDATE
exports.updateBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const query = `UPDATE breakdown SET ${setClause}, updated_at = CURRENT_DATE WHERE breakdown_id = $${fields.length + 1} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Breakdown not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating breakdown', error: error.message });
  }
};

// DELETE
exports.deleteBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM breakdown WHERE breakdown_id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Breakdown not found' });
    }

    res.json({ message: 'Breakdown deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting breakdown', error: error.message });
  }
};
