const pool = require('../db');

// CREATE
exports.createPartRejection = async (req, res) => {
  try {
    const {
      machine_id, plan_id, shift_no,
      part_name, quantity,
      rejectionreason, rejectiontype,
      date, updated_at
    } = req.body;

     console.log(req.body)

    const result = await pool.query(`
      INSERT INTO partrejection (
        machine_id, plan_id, shift_no,
        part_name, quantity,
        rejectionreason, rejectiontype,
        date, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        machine_id, plan_id, shift_no,
        part_name, quantity,
        rejectionreason, rejectiontype,
        date || new Date(), updated_at || []
      ]
    );

    res.status(201).json(result.rows[0]);
    console.log(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error creating part rejection', error: error.message });
  }
};

// READ ALL
// exports.getAllPartRejections = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM partrejection ORDER BY date DESC');
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching part rejections', error: error.message });
//   }
// };

exports.getAllPartRejections = async (req, res) => {
  const sql = `
    SELECT
      r.*,
      m.machine_name_type
    FROM partrejection r
    JOIN machine_master m
      ON r.machine_id = m.machine_id
    ORDER BY r.date DESC;
  `;

  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all part rejections:', error);
    res.status(500).json({
      message: 'Error fetching part rejections',
      error: error.message
    });
  }
};

// READ BY ID
exports.getPartRejectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM partrejection WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Part rejection not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching part rejection', error: error.message });
  }
};

// UPDATE
exports.updatePartRejection = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `UPDATE partrejection SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Part rejection not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating part rejection', error: error.message });
  }
};

// DELETE
exports.deletePartRejection = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM partrejection WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Part rejection not found' });
    }

    res.json({ message: 'Part rejection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting part rejection', error: error.message });
  }
};


exports.getTodayPartRejectionsByMachine = async (req, res) => {
  const { machineId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT *
         FROM partrejection
        WHERE date = CURRENT_DATE
          AND machine_id = $1
        ORDER BY date DESC`,
      [machineId]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching today’s part rejections by machine:', error);
    return res.status(500).json({
      message: 'Error fetching today’s part rejections',
      details: error.message
    });
  }
};


exports.getPartRejectionsByMachine = async (req, res) => {
  const { machineId } = req.params;                     // 1️⃣ grab from /:machineId
  try {
    const result = await pool.query(
      `SELECT *
         FROM partrejection
        WHERE machine_id = $1
     ORDER BY date DESC`,
      [machineId]                                       // 2️⃣ parameterize!
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching part rejections', error: error.message });
  }
};