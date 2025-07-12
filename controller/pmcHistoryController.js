const pool = require("../db"); // PostgreSQL pool connection

// Create a new history record
exports.createHistory = async (req, res) => {
  try {
    const {
      machine_id, pmc_parameter_id, parameter_name, register_address,
      boolean_expected_value, min_value, max_value, unit,
      alert_threshold, data_collection_frequency, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO pmc_history (
        machine_id, pmc_parameter_id, parameter_name, register_address,
        boolean_expected_value, min_value, max_value, unit,
        alert_threshold, data_collection_frequency, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        machine_id, pmc_parameter_id, parameter_name, register_address,
        boolean_expected_value, min_value, max_value, unit,
        alert_threshold, data_collection_frequency, status
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating PMC history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all history records
exports.getAllHistory = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pmc_history ORDER BY pmc_history_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching PMC history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get single history record by ID
exports.getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM pmc_history WHERE pmc_history_id = $1", [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "History record not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching history by ID:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a history record
exports.updateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      machine_id, pmc_parameter_id, parameter_name, register_address,
      boolean_expected_value, min_value, max_value, unit,
      alert_threshold, data_collection_frequency, status
    } = req.body;

    const result = await pool.query(
      `UPDATE pmc_history SET
        machine_id = $1, pmc_parameter_id = $2, parameter_name = $3,
        register_address = $4, boolean_expected_value = $5,
        min_value = $6, max_value = $7, unit = $8,
        alert_threshold = $9, data_collection_frequency = $10,
        status = $11, updated_at = now()
      WHERE pmc_history_id = $12 RETURNING *`,
      [
        machine_id, pmc_parameter_id, parameter_name, register_address,
        boolean_expected_value, min_value, max_value, unit,
        alert_threshold, data_collection_frequency, status, id
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "History record not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating PMC history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a history record
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM pmc_history WHERE pmc_history_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "History record not found" });

    res.json({ message: "Deleted successfully", deleted: result.rows[0] });
  } catch (err) {
    console.error("Error deleting PMC history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
