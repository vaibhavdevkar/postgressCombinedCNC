
const pool = require('../db');
const fs   = require('fs');

// Helper: delete old files
async function deleteOldFiles(id) {
  const { rows } = await pool.query(
    'SELECT picture, documents FROM user_master WHERE user_id = $1',
    [id]
  );
  if (!rows[0]) return;
  const { picture, documents } = rows[0];
  if (picture) fs.unlink(picture, () => {});
  if (Array.isArray(documents)) {
    documents.forEach(doc => fs.unlink(doc, () => {}));
  }
}

// CREATE
exports.createUser = async (req, res) => {
  const {
    employee_code,
    full_name,
    user_role,
    mobile_number,
    email_id,
    username,
    password,
    access_level,
    fingerprint,
    pin,
    joining_date,
    department,
    status,
    shift_assignment,
    line_assigned,
    machines_assigned
  } = req.body;

  // Safely retrieve uploaded files
  const picture = Array.isArray(req.files?.picture)
    ? req.files.picture[0].path
    : null;
  const documents = Array.isArray(req.files?.documents)
    ? req.files.documents.map(f => f.path)
    : [];

  try {
    const { rows } = await pool.query(
      `INSERT INTO user_master
         (
           employee_code, full_name, user_role,
           mobile_number, email_id,
           username, password, access_level,
           fingerprint, pin,
           joining_date, department,
           status, shift_assignment,
           line_assigned, machines_assigned,
           picture, documents
         )
       VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *;`,
      [
        employee_code,
        full_name,
        user_role,
        mobile_number,
        email_id || null,
        username  || null,
        password  || null,
        access_level || null,
        fingerprint || null,
        pin         || null,
        joining_date || null,
        department   || null,
        status,
        shift_assignment || null,
        line_assigned ? Number(line_assigned) : null,
        Array.isArray(machines_assigned)
          ? machines_assigned.map(Number)
          : null,
        picture,
        documents.length ? documents : null
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    // cleanup on failure
    if (picture) fs.unlink(picture, () => {});
    documents.forEach(doc => fs.unlink(doc, () => {}));
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
exports.getAllUsers = async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_master ORDER BY user_id;'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getUserById = async (req, res) => {
  const rawId = req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'user_id must be an integer.' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_master WHERE user_id = $1;', 
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// UPDATE
exports.updateUser = async (req, res) => {
  const rawId = req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'user_id must be an integer.' });
  }

  const {
    employee_code,
    full_name,
    user_role,
    mobile_number,
    email_id,
    username,
    password,
    access_level,
    fingerprint,
    pin,
    joining_date,
    department,
    status,
    shift_assignment,
    line_assigned,
    machines_assigned
  } = req.body;

  // Safely retrieve/cleanup files
  let picture;
  if (Array.isArray(req.files?.picture)) {
    await deleteOldFiles(id);
    picture = req.files.picture[0].path;
  } else {
    const { rows } = await pool.query(
      'SELECT picture FROM user_master WHERE user_id = $1;', [id]
    );
    picture = rows[0]?.picture || null;
  }

  let documents;
  if (Array.isArray(req.files?.documents)) {
    await deleteOldFiles(id);
    documents = req.files.documents.map(f => f.path);
  } else {
    const { rows } = await pool.query(
      'SELECT documents FROM user_master WHERE user_id = $1;', [id]
    );
    documents = rows[0]?.documents || [];
  }

  try {
    const { rows } = await pool.query(
      `UPDATE user_master SET
         employee_code     = $1,
         full_name         = $2,
         user_role         = $3,
         mobile_number     = $4,
         email_id          = $5,
         username          = $6,
         password          = $7,
         access_level      = $8,
         fingerprint       = $9,
         pin               = $10,
         joining_date      = $11,
         department        = $12,
         status            = $13,
         shift_assignment  = $14,
         line_assigned     = $15,
         machines_assigned = $16,
         picture           = $17,
         documents         = $18,
         updated_at        = NOW()
       WHERE user_id = $19
       RETURNING *;`,
      [
        employee_code,
        full_name,
        user_role,
        mobile_number,
        email_id  || null,
        username  || null,
        password  || null,
        access_level || null,
        fingerprint || null,
        pin         || null,
        joining_date || null,
        department   || null,
        status,
        shift_assignment || null,
        line_assigned ? Number(line_assigned) : null,
        Array.isArray(machines_assigned)
          ? machines_assigned.map(Number)
          : null,
        picture,
        documents.length ? documents : null,
        id
      ]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// DELETE
exports.deleteUser = async (req, res) => {
  const rawId = req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'user_id must be an integer.' });
  }
  try {
    await deleteOldFiles(id);
    const result = await pool.query(
      'DELETE FROM user_master WHERE user_id = $1;', [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Not found.' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};