const pool = require("../db"); // PostgreSQL connection pool

// exports.createAlert = async (req, res) => {
//   try {
//     const {
//       machine_id, pmc_parameter_id, timestamp, parameter_value,
//       alert_threshold, status, alert_type, resolved_timestamp
//     } = req.body;

//     const result = await pool.query(
//       `INSERT INTO alerts (
//         machine_id, pmc_parameter_id, timestamp, parameter_value,
//         alert_threshold, status, alert_type, resolved_timestamp
//       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
//       [
//         machine_id, pmc_parameter_id, timestamp, parameter_value,
//         alert_threshold, status, alert_type, resolved_timestamp
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Create Alert Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.getAllAlerts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alerts ORDER BY alert_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get All Alerts Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM alerts WHERE alert_id = $1", [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Alert not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get Alert By ID Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// exports.updateAlert = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       machine_id, pmc_parameter_id, timestamp, parameter_value,
//       alert_threshold, status, alert_type, resolved_timestamp
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE alerts SET
//         machine_id = $1, pmc_parameter_id = $2, timestamp = $3,
//         parameter_value = $4, alert_threshold = $5, status = $6,
//         alert_type = $7, resolved_timestamp = $8
//       WHERE alert_id = $9 RETURNING *`,
//       [
//         machine_id, pmc_parameter_id, timestamp, parameter_value,
//         alert_threshold, status, alert_type, resolved_timestamp, id
//       ]
//     );

//     if (result.rows.length === 0) return res.status(404).json({ message: "Alert not found" });

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Update Alert Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.deleteAlert = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query("DELETE FROM alerts WHERE alert_id = $1 RETURNING *", [id]);

//     if (result.rows.length === 0) return res.status(404).json({ message: "Alert not found" });

//     res.json({ message: "Deleted successfully", deleted: result.rows[0] });
//   } catch (err) {
//     console.error("Delete Alert Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


exports.getAllAlerts1 = async (req, res) => {
  const sql = `
    SELECT *
    FROM public.alerts_1
    ORDER BY triggered_at DESC
  `;
  try {
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({
      message: 'Error fetching alerts',
      error: err.message
    });
  }
};


exports.getAlertsByMachine = async (req, res) => {
  const { machineId } = req.params;        // 1️⃣ pull from /:machineId
  const sql = `
    SELECT *
      FROM public.alerts_1
     WHERE machine_id = $1
  ORDER BY triggered_at DESC
  `;
  try {
    const { rows } = await pool.query(sql, [machineId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: `No alerts found for machine ${machineId}` });
    }
    res.json(rows);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({
      message: 'Error fetching alerts',
      error: err.message,
    });
  }
};