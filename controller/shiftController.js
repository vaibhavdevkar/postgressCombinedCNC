// 4. controllers/shiftController.js
const pool = require('../db');

// helper: convert "HH:MM:SS" → seconds since midnight
function toSeconds(t) {
  const [h,m,s] = t.split(':').map(Number);
  return h*3600 + m*60 + s;
}

// CREATE
exports.createShift = async (req, res) => {
  const {
    shift_code,
    shift_name,
    shift_start_time,
    shift_end_time,
    plant_id,
    line_id,
    status,
    created_by
  } = req.body;

  // compute duration & overnight flag
  let startSec = toSeconds(shift_start_time);
  let endSec   = toSeconds(shift_end_time);
  let diff     = endSec - startSec;
  let isNight  = false;
  if (diff <= 0) {
    diff    += 24*3600;  // spans midnight
    isNight = true;
  }
  const shift_duration_mins = Math.round(diff / 60);

  try {
    const { rows } = await pool.query(
      `INSERT INTO shift_master
        (shift_code, shift_name, shift_start_time, shift_end_time,
         shift_duration_mins, is_night_shift, plant_id, line_id,
         status, created_by)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *;`,
      [
        shift_code,
        shift_name,
        shift_start_time,
        shift_end_time,
        shift_duration_mins,
        isNight,
        plant_id || null,
        line_id  || null,
        status,
        created_by || null
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating shift:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
exports.getAllShifts = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM shift_master ORDER BY shift_id;'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getShiftById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM shift_master WHERE shift_id = $1;',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching shift:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// UPDATE
exports.updateShift = async (req, res) => {
  const { id } = req.params;
  const {
    shift_code,
    shift_name,
    shift_start_time,
    shift_end_time,
    plant_id,
    line_id,
    status,
    created_by
  } = req.body;

  // recompute
  let startSec = toSeconds(shift_start_time);
  let endSec   = toSeconds(shift_end_time);
  let diff     = endSec - startSec;
  let isNight  = false;
  if (diff <= 0) {
    diff    += 24*3600;
    isNight = true;
  }
  const shift_duration_mins = Math.round(diff / 60);

  try {
    const { rows } = await pool.query(
      `UPDATE shift_master SET
         shift_code           = $1,
         shift_name           = $2,
         shift_start_time     = $3,
         shift_end_time       = $4,
         shift_duration_mins  = $5,
         is_night_shift       = $6,
         plant_id             = $7,
         line_id              = $8,
         status               = $9,
         created_by           = $10,
         updated_at           = NOW()
       WHERE shift_id = $11
       RETURNING *;`,
      [
        shift_code,
        shift_name,
        shift_start_time,
        shift_end_time,
        shift_duration_mins,
        isNight,
        plant_id || null,
        line_id  || null,
        status,
        created_by || null,
        id
      ]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating shift:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// DELETE
exports.deleteShift = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM shift_master WHERE shift_id = $1;',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Not found.' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting shift:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};
