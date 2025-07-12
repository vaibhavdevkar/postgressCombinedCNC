const pool = require('../db');

// CREATE
exports.createGaugeLog = async (req, res) => {
  const {
    gauge_id,
    part_id,
    serial_number_or_vin,
    measurement_type,
    target_value,
    measured_value,
    min_tolerance,
    max_tolerance,
    result,
    unit,
    measurement_timestamp,
    operator_id,
    gauge_calibration_valid,
    remarks
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO public.gauge_log (
         gauge_id, part_id, serial_number_or_vin, measurement_type,
         target_value, measured_value, min_tolerance, max_tolerance,
         result, unit, measurement_timestamp, operator_id,
         gauge_calibration_valid, remarks
       ) VALUES (
         $1, $2, $3, $4,
         $5, $6, $7, $8,
         $9, $10, $11, $12,
         $13, $14
       )
       RETURNING *`,
      [
        gauge_id,
        part_id,
        serial_number_or_vin,
        measurement_type,
        target_value,
        measured_value,
        min_tolerance,
        max_tolerance,
        result,
        unit,
        measurement_timestamp,
        operator_id,
        gauge_calibration_valid,
        remarks
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating gauge log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ ALL
exports.getAllGaugeLogs = async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM public.gauge_log ORDER BY gauge_log_id`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching gauge logs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ ONE
exports.getGaugeLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM public.gauge_log WHERE gauge_log_id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Gauge log not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching gauge log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE
exports.updateGaugeLog = async (req, res) => {
  const { id } = req.params;
  const {
    gauge_id,
    part_id,
    serial_number_or_vin,
    measurement_type,
    target_value,
    measured_value,
    min_tolerance,
    max_tolerance,
    result,
    unit,
    measurement_timestamp,
    operator_id,
    gauge_calibration_valid,
    remarks
  } = req.body;

  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE public.gauge_log SET
         gauge_id               = $1,
         part_id                = $2,
         serial_number_or_vin   = $3,
         measurement_type       = $4,
         target_value           = $5,
         measured_value         = $6,
         min_tolerance          = $7,
         max_tolerance          = $8,
         result                 = $9,
         unit                   = $10,
         measurement_timestamp  = $11,
         operator_id            = $12,
         gauge_calibration_valid= $13,
         remarks                = $14
       WHERE gauge_log_id = $15
       RETURNING *`,
      [
        gauge_id,
        part_id,
        serial_number_or_vin,
        measurement_type,
        target_value,
        measured_value,
        min_tolerance,
        max_tolerance,
        result,
        unit,
        measurement_timestamp,
        operator_id,
        gauge_calibration_valid,
        remarks,
        id
      ]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Gauge log not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating gauge log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE
exports.deleteGaugeLog = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM public.gauge_log WHERE gauge_log_id = $1`,
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Gauge log not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting gauge log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};