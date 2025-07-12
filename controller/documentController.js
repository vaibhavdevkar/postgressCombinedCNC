const pool    = require('../db');
const fs      = require('fs');

// delete old file helper
async function deleteOldFile(id) {
  const { rows } = await pool.query(
    'SELECT document_path FROM document_master WHERE document_id = $1',
    [id]
  );
  const oldPath = rows[0]?.document_path;
  if (oldPath) fs.unlink(oldPath, err => err && console.warn(err));
}

// CREATE
exports.createDocument = async (req, res) => {
  const {
    document_title,
    document_type,
    machine_id,
    part_id,
    process_id,
    document_category,
    uploaded_by,
    remarks
  } = req.body;

  const document_path = req.file ? req.file.path : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO document_master
        (
          document_title, document_type,
          machine_id, part_id, process_id,
          document_category, document_path,
          uploaded_by, remarks
        )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *;`,
      [
        document_title,
        document_type,
        machine_id || null,
        part_id    || null,
        process_id || null,
        document_category || null,
        document_path,
        uploaded_by || null,
        remarks     || null
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
exports.getAllDocuments = async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM document_master ORDER BY uploaded_on DESC;'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getDocumentById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM document_master WHERE document_id = $1;',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching document:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// UPDATE
exports.updateDocument = async (req, res) => {
  const { id } = req.params;
  const {
    document_title,
    document_type,
    machine_id,
    part_id,
    process_id,
    document_category,
    uploaded_by,
    remarks
  } = req.body;

  let document_path;
  if (req.file) {
    await deleteOldFile(id);
    document_path = req.file.path;
  } else {
    const { rows } = await pool.query(
      'SELECT document_path FROM document_master WHERE document_id = $1;',
      [id]
    );
    document_path = rows[0]?.document_path || null;
  }

  try {
    const { rows } = await pool.query(
      `UPDATE document_master SET
         document_title    = $1,
         document_type     = $2,
         machine_id        = $3,
         part_id           = $4,
         process_id        = $5,
         document_category = $6,
         document_path     = $7,
         uploaded_by       = $8,
         uploaded_on       = NOW(),
         remarks           = $9
       WHERE document_id = $10
       RETURNING *;`,
      [
        document_title,
        document_type,
        machine_id || null,
        part_id    || null,
        process_id || null,
        document_category || null,
        document_path,
        uploaded_by || null,
        remarks     || null,
        id
      ]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// DELETE
exports.deleteDocument = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteOldFile(id);
    const result = await pool.query(
      'DELETE FROM document_master WHERE document_id = $1;',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Not found.' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};
