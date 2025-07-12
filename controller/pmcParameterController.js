const pool = require('../db');

// CREATE
exports.createPmcParameter = async (req, res) => {
  const {
    machine_id,
    parameter_name,
    register_address,
    boolean_expected_value,
    min_value,
    max_value,
    unit,
    alert_threshold,
    data_collection_frequency
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO pmc_parameter_master
         (machine_id, parameter_name, register_address,
          boolean_expected_value, min_value, max_value,
          unit, alert_threshold, data_collection_frequency)
       VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *;`,
      [
        machine_id,
        parameter_name,
        register_address,
        boolean_expected_value,
        min_value,
        max_value,
        unit,
        alert_threshold,
        data_collection_frequency
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating PMC parameter:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
exports.getAllPmcParameters = async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM pmc_parameter_master ORDER BY pmc_parameter_id;'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching PMC parameters:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getPmcParameterById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM pmc_parameter_master WHERE pmc_parameter_id = $1;',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching PMC parameter:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// UPDATE
exports.updatePmcParameter = async (req, res) => {
  const { id } = req.params;
  const {
    machine_id,
    parameter_name,
    register_address,
    boolean_expected_value,
    min_value,
    max_value,
    unit,
    alert_threshold,
    data_collection_frequency
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE pmc_parameter_master SET
         machine_id                = $1,
         parameter_name            = $2,
         register_address          = $3,
         boolean_expected_value    = $4,
         min_value                 = $5,
         max_value                 = $6,
         unit                       = $7,
         alert_threshold           = $8,
         data_collection_frequency = $9,
         updated_at                = NOW()
       WHERE pmc_parameter_id = $10
       RETURNING *;`,
      [
        machine_id,
        parameter_name,
        register_address,
        boolean_expected_value,
        min_value,
        max_value,
        unit,
        alert_threshold,
        data_collection_frequency,
        id
      ]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating PMC parameter:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// DELETE
exports.deletePmcParameter = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM pmc_parameter_master WHERE pmc_parameter_id = $1;',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Not found.' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting PMC parameter:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};
