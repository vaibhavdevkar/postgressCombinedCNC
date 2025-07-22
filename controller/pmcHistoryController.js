// const pool = require("../db"); // PostgreSQL pool connection

// // Create a new history record
// exports.createHistory = async (req, res) => {
//   try {
//     const {
//       machine_id, pmc_parameter_id, parameter_name, register_address,
//       boolean_expected_value, min_value, max_value, unit,
//       alert_threshold, data_collection_frequency, status
//     } = req.body;

//     const result = await pool.query(
//       `INSERT INTO pmc_history (
//         machine_id, pmc_parameter_id, parameter_name, register_address,
//         boolean_expected_value, min_value, max_value, unit,
//         alert_threshold, data_collection_frequency, status
//       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
//       RETURNING *`,
//       [
//         machine_id, pmc_parameter_id, parameter_name, register_address,
//         boolean_expected_value, min_value, max_value, unit,
//         alert_threshold, data_collection_frequency, status
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Error creating PMC history:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Get all history records
// exports.getAllHistory = async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM pmc_history ORDER BY pmc_history_id DESC");
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error fetching PMC history:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Get single history record by ID
// exports.getHistoryById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query("SELECT * FROM pmc_history WHERE pmc_history_id = $1", [id]);

//     if (result.rows.length === 0)
//       return res.status(404).json({ message: "History record not found" });

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Error fetching history by ID:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Update a history record
// exports.updateHistory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       machine_id, pmc_parameter_id, parameter_name, register_address,
//       boolean_expected_value, min_value, max_value, unit,
//       alert_threshold, data_collection_frequency, status
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE pmc_history SET
//         machine_id = $1, pmc_parameter_id = $2, parameter_name = $3,
//         register_address = $4, boolean_expected_value = $5,
//         min_value = $6, max_value = $7, unit = $8,
//         alert_threshold = $9, data_collection_frequency = $10,
//         status = $11, updated_at = now()
//       WHERE pmc_history_id = $12 RETURNING *`,
//       [
//         machine_id, pmc_parameter_id, parameter_name, register_address,
//         boolean_expected_value, min_value, max_value, unit,
//         alert_threshold, data_collection_frequency, status, id
//       ]
//     );

//     if (result.rows.length === 0)
//       return res.status(404).json({ message: "History record not found" });

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Error updating PMC history:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Delete a history record
// exports.deleteHistory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       "DELETE FROM pmc_history WHERE pmc_history_id = $1 RETURNING *",
//       [id]
//     );

//     if (result.rows.length === 0)
//       return res.status(404).json({ message: "History record not found" });

//     res.json({ message: "Deleted successfully", deleted: result.rows[0] });
//   } catch (err) {
//     console.error("Error deleting PMC history:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



// controllers/pmcHistoryController.js
const pool = require('../db');

// GET /pmc-history
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pmc_history ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pmc_history' });
  }
};

// GET /pmc-history/:id
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM pmc_history WHERE id = $1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
};

// POST /pmc-history
exports.create = async (req, res) => {
  const {
    pmc_parameter_id,
    machine_id,
    parameter_value,
    status,
    start_time,
    duration,
    end_time,
  } = req.body;

  const sql = `
    INSERT INTO pmc_history
      (pmc_parameter_id, machine_id, parameter_value, status, start_time, duration, end_time)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(sql, [
      pmc_parameter_id,
      machine_id,
      parameter_value,
      status,
      start_time,
      duration,
      end_time,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

// PUT /pmc-history/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const {
    pmc_parameter_id,
    machine_id,
    parameter_value,
    status,
    start_time,
    duration,
    end_time,
  } = req.body;

  const sql = `
    UPDATE pmc_history SET
      pmc_parameter_id = $1,
      machine_id       = $2,
      parameter_value  = $3,
      status           = $4,
      start_time       = $5,
      duration         = $6,
      end_time         = $7
    WHERE id = $8
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(sql, [
      pmc_parameter_id,
      machine_id,
      parameter_value,
      status,
      start_time,
      duration,
      end_time,
      id,
    ]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
};

// DELETE /pmc-history/:id
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM pmc_history WHERE id = $1 RETURNING *;',
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', entry: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};


exports.getAllWithParameterName = async (req, res) => {
  const sql = `
    SELECT
      h.*,
      p.parameter_name
    FROM public.pmc_history AS h
    JOIN public.pmc_parameter_master AS p
      ON h.pmc_parameter_id = p.pmc_parameter_id
    ORDER BY h.id;
  `;

  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching joined data:', err);
    res.status(500).json({ error: 'Failed to fetch pmc history with parameter names' });
  }
};



exports.getalldataforhistory = async (req, res) => {
  try {
    const query = `
      SELECT
        h.*,
        p.parameter_name,
        p.register_address,
        p.bit_position,
        m.machine_name_type
      FROM public.pmc_history AS h
      INNER JOIN public.pmc_parameter_master AS p
        ON h.pmc_parameter_id = p.pmc_parameter_id
      INNER JOIN public.machine_master AS m
        ON p.machine_id = m.machine_id
      ORDER BY h.id;
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching PMC history with parameter & machine details:', err);
    res.status(500).json({ error: 'Failed to fetch PMC history' });
  }
};