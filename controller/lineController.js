// // controllers/lineController.js
// const pool = require('../db');

// // 1. Create
// exports.createLine = async (req, res) => {
//   const {
//     line_name,
//     plant_shop_id,
//     line_type,
//     process_type,
//     target_oee_output,
//     layout_upload,
//     status,
//     remarks
//   } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `INSERT INTO line_master
//         (line_name, plant_shop_id, line_type, process_type, target_oee_output, layout_upload, status, remarks)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//        RETURNING *;`,
//       [
//         line_name,
//         plant_shop_id,
//         line_type,
//         process_type,
//         target_oee_output,
//         layout_upload,
//         status,
//         remarks
//       ]
//     );
//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // 2. Read all
// exports.getAllLines = async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM line_master ORDER BY line_id;'
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // 3. Read one
// exports.getLineById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM line_master WHERE line_id = $1;',
//       [id]
//     );
//     if (!rows.length) return res.status(404).json({ message: 'Not found.' });
//     res.json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // 4. Update
// exports.updateLine = async (req, res) => {
//   const { id } = req.params;
//   const {
//     line_name,
//     plant_shop_id,
//     line_type,
//     process_type,
//     target_oee_output,
//     layout_upload,
//     status,
//     remarks
//   } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `UPDATE line_master SET
//         line_name = $1,
//         plant_shop_id = $2,
//         line_type = $3,
//         process_type = $4,
//         target_oee_output = $5,
//         layout_upload = $6,
//         status = $7,
//         remarks = $8,
//         updated_at = NOW()
//        WHERE line_id = $9
//        RETURNING *;`,
//       [
//         line_name,
//         plant_shop_id,
//         line_type,
//         process_type,
//         target_oee_output,
//         layout_upload,
//         status,
//         remarks,
//         id
//       ]
//     );
//     if (!rows.length) return res.status(404).json({ message: 'Not found.' });
//     res.json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // 5. Delete
// exports.deleteLine = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'DELETE FROM line_master WHERE line_id = $1;',
//       [id]
//     );
//     if (result.rowCount === 0) return res.status(404).json({ message: 'Not found.' });
//     res.status(204).send();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };


const pool = require('../db');
const fs = require('fs');

// Helper to delete old file when updating
async function deleteOldFile(id) {
  const { rows } = await pool.query(
    'SELECT layout_upload FROM line_master WHERE line_id=$1',
    [id]
  );
  if (rows[0] && rows[0].layout_upload) {
    fs.unlink(rows[0].layout_upload, err => {
      if (err) console.warn('Failed to delete old file:', err);
    });
  }
}

// CREATE
exports.createLine = async (req, res) => {
  const {
    line_name,
    plant_shop_id,
    line_type,
    process_type,
    target_oee_output,
    status,
    remarks
  } = req.body;

  // multer puts the file info on req.file
  const layout_upload = req.file ? req.file.path : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO line_master
        (line_name, plant_shop_id, line_type, process_type,
         target_oee_output, layout_upload, status, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *;`,
      [
        line_name,
        plant_shop_id,
        line_type,
        process_type,
        target_oee_output,
        layout_upload,
        status,
        remarks
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
exports.getAllLines = async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM line_master ORDER BY line_id;');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getLineById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM line_master WHERE line_id = $1;',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// UPDATE
exports.updateLine = async (req, res) => {
  const { id } = req.params;
  const {
    line_name,
    plant_shop_id,
    line_type,
    process_type,
    target_oee_output,
    status,
    remarks
  } = req.body;

  // if a new file is uploaded, delete the old one
  let layout_upload = null;
  if (req.file) {
    await deleteOldFile(id);
    layout_upload = req.file.path;
  }

  // if no new file, keep existing path
  if (!layout_upload) {
    const { rows } = await pool.query(
      'SELECT layout_upload FROM line_master WHERE line_id = $1',
      [id]
    );
    layout_upload = rows[0] ? rows[0].layout_upload : null;
  }

  try {
    const { rows } = await pool.query(
      `UPDATE line_master SET
         line_name            = $1,
         plant_shop_id        = $2,
         line_type            = $3,
         process_type         = $4,
         target_oee_output    = $5,
         layout_upload        = $6,
         status               = $7,
         remarks              = $8,
         updated_at           = NOW()
       WHERE line_id = $9
       RETURNING *;`,
      [
        line_name,
        plant_shop_id,
        line_type,
        process_type,
        target_oee_output,
        layout_upload,
        status,
        remarks,
        id
      ]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// DELETE
exports.deleteLine = async (req, res) => {
  const { id } = req.params;
  try {
    // remove file too
    await deleteOldFile(id);

    const result = await pool.query(
      'DELETE FROM line_master WHERE line_id = $1;',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Not found.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
};
