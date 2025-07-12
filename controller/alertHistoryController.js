const pool = require("../db"); // PostgreSQL connection pool

// exports.createAlertHistory = async (req, res) => {
//   try {
//     const {
//       machine_id, alert_id, alert_start_time, alert_end_time,
//       action_taken, resolved_by, escalated_to
//     } = req.body;

//     const result = await pool.query(
//       `INSERT INTO alert_history (
//         machine_id, alert_id, alert_start_time, alert_end_time,
//         action_taken, resolved_by, escalated_to
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//       [machine_id, alert_id, alert_start_time, alert_end_time, action_taken, resolved_by, escalated_to]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Create Alert History Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.getAllAlertHistories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alert_history ORDER BY alert_history_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get All Alert Histories Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAlertHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM alert_history WHERE alert_history_id = $1", [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Alert history not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get Alert History By ID Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// exports.updateAlertHistory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       machine_id, alert_id, alert_start_time, alert_end_time,
//       action_taken, resolved_by, escalated_to
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE alert_history SET
//         machine_id = $1, alert_id = $2, alert_start_time = $3,
//         alert_end_time = $4, action_taken = $5, resolved_by = $6,
//         escalated_to = $7
//       WHERE alert_history_id = $8 RETURNING *`,
//       [machine_id, alert_id, alert_start_time, alert_end_time, action_taken, resolved_by, escalated_to, id]
//     );

//     if (result.rows.length === 0)
//       return res.status(404).json({ message: "Alert history not found" });

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Update Alert History Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.deleteAlertHistory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query("DELETE FROM alert_history WHERE alert_history_id = $1 RETURNING *", [id]);

//     if (result.rows.length === 0)
//       return res.status(404).json({ message: "Alert history not found" });

//     res.json({ message: "Deleted successfully", deleted: result.rows[0] });
//   } catch (err) {
//     console.error("Delete Alert History Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
