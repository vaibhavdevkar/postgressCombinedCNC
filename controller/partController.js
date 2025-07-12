// // controllers/partController.js
// const pool = require('../db');

// // CREATE
// exports.createPart = async (req, res) => {
//   const {
//     part_name_code,
//     drawing_no_revision,
//     customer,
//     product_family,
//     material,
//     part_weight_dimensions,
//     cad_design_upload,
//     max_production_per_day,
//     takt_time
//   } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `INSERT INTO part_master
//         (part_name_code, drawing_no_revision, customer,
//          product_family, material, part_weight_dimensions,
//          cad_design_upload, max_production_per_day, takt_time)
//        VALUES
//         ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//        RETURNING *;`,
//       [
//         part_name_code,
//         drawing_no_revision,
//         customer,
//         product_family,
//         material,
//         part_weight_dimensions,
//         cad_design_upload,
//         max_production_per_day,
//         takt_time
//       ]
//     );
//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error('Error creating part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // READ ALL
// exports.getAllParts = async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM part_master ORDER BY part_id;'
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching parts:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // READ ONE
// exports.getPartById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM part_master WHERE part_id = $1;',
//       [id]
//     );
//     if (!rows.length) return res.status(404).json({ message: 'Not found.' });
//     res.json(rows[0]);
//   } catch (err) {
//     console.error('Error fetching part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // UPDATE
// exports.updatePart = async (req, res) => {
//   const { id } = req.params;
//   console.log(req.params)
//   const {
//     part_name_code,
//     drawing_no_revision,
//     customer,
//     product_family,
//     material,
//     part_weight_dimensions,
//     cad_design_upload,
//     max_production_per_day,
//     takt_time
//   } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `UPDATE part_master SET
//          part_name_code           = $1,
//          drawing_no_revision      = $2,
//          customer                 = $3,
//          product_family           = $4,
//          material                 = $5,
//          part_weight_dimensions   = $6,
//          cad_design_upload        = $7,
//          max_production_per_day   = $8,
//          takt_time                = $9,
//          updated_at               = NOW()
//        WHERE part_id = $10
//        RETURNING *;`,
//       [
//         part_name_code,
//         drawing_no_revision,
//         customer,
//         product_family,
//         material,
//         part_weight_dimensions,
//         cad_design_upload,
//         max_production_per_day,
//         takt_time,
//         id
//       ]
//     );
//     if (!rows.length) return res.status(404).json({ message: 'Not found.' });
//     res.json(rows[0]);
//   } catch (err) {
//     console.error('Error updating part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // DELETE
// exports.deletePart = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'DELETE FROM part_master WHERE part_id = $1;',
//       [id]
//     );
//     if (result.rowCount === 0)
//       return res.status(404).json({ message: 'Not found.' });
//     res.status(204).send();
//   } catch (err) {
//     console.error('Error deleting part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };



// // controllers/partController.js
// const pool = require('../db');

// // CREATE
// exports.createPart = async (req, res) => {
//   const {
//     part_name,              // ← new
//     part_name_code,
//     drawing_no_revision,
//     customer,
//     product_family,
//     material,
//     part_weight_dimensions,
//     cad_design_upload,
//     max_production_per_day,
//     takt_time
//   } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `INSERT INTO part_master
//         (
//           part_name,
//           part_name_code,
//           drawing_no_revision,
//           customer,
//           product_family,
//           material,
//           part_weight_dimensions,
//           cad_design_upload,
//           max_production_per_day,
//           takt_time
//         )
//        VALUES
//         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
//        RETURNING *;`,
//       [
//         part_name,
//         part_name_code,
//         drawing_no_revision,
//         customer,
//         product_family,
//         material,
//         part_weight_dimensions,
//         cad_design_upload,
//         max_production_per_day,
//         takt_time
//       ]
//     );
//     res.status(201).json(rows[0]);
//   } catch (err) {
//     console.error('Error creating part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // READ ALL
// exports.getAllParts = async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM part_master ORDER BY part_id;'
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching parts:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // READ ONE
// exports.getPartById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM part_master WHERE part_id = $1;',
//       [id]
//     );
//     if (!rows.length) return res.status(404).json({ message: 'Not found.' });
//     res.json(rows[0]);
//   } catch (err) {
//     console.error('Error fetching part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // UPDATE
// exports.updatePart = async (req, res) => {
//   const { id } = req.params;
//   const {
//     part_name,              // ← new
//     part_name_code,
//     drawing_no_revision,
//     customer,
//     product_family,
//     material,
//     part_weight_dimensions,
//     cad_design_upload,
//     max_production_per_day,
//     takt_time
//   } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `UPDATE part_master SET
//          part_name                = $1,
//          part_name_code           = $2,
//          drawing_no_revision      = $3,
//          customer                 = $4,
//          product_family           = $5,
//          material                 = $6,
//          part_weight_dimensions   = $7,
//          cad_design_upload        = $8,
//          max_production_per_day   = $9,
//          takt_time                = $10,
//          updated_at               = NOW()
//        WHERE part_id = $11
//        RETURNING *;`,
//       [
//         part_name,
//         part_name_code,
//         drawing_no_revision,
//         customer,
//         product_family,
//         material,
//         part_weight_dimensions,
//         cad_design_upload,
//         max_production_per_day,
//         takt_time,
//         id
//       ]
//     );
//     if (!rows.length) return res.status(404).json({ message: 'Not found.' });
//     res.json(rows[0]);
//   } catch (err) {
//     console.error('Error updating part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

// // DELETE
// exports.deletePart = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'DELETE FROM part_master WHERE part_id = $1;',
//       [id]
//     );
//     if (result.rowCount === 0)
//       return res.status(404).json({ message: 'Not found.' });
//     res.status(204).send();
//   } catch (err) {
//     console.error('Error deleting part:', err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };


const pool = require('../db');
const fs   = require('fs');

// Helper to delete old CAD file on update or delete
async function deleteOldFile(partId) {
  const { rows } = await pool.query(
    'SELECT cad_design_upload FROM part_master WHERE part_id = $1',
    [partId]
  );
  if (rows[0] && rows[0].cad_design_upload) {
    fs.unlink(rows[0].cad_design_upload, err => {
      if (err) console.warn('Could not delete old file:', err);
    });
  }
}

// CREATE
exports.createPart = async (req, res) => {
  const {
    part_name,
    part_name_code,
    drawing_no_revision,
    customer,
    product_family,
    material,
    part_weight_dimensions,
    max_production_per_day,
    takt_time
  } = req.body;

  // multer places file info on req.file
  const cad_design_upload = req.file ? req.file.path : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO part_master
        (
          part_name,
          part_name_code,
          drawing_no_revision,
          customer,
          product_family,
          material,
          part_weight_dimensions,
          cad_design_upload,
          max_production_per_day,
          takt_time
        )
       VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *;`,
      [
        part_name,
        part_name_code,
        drawing_no_revision,
        customer,
        product_family,
        material,
        part_weight_dimensions,
        cad_design_upload,
        max_production_per_day,
        takt_time
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating part:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
exports.getAllParts = async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM part_master ORDER BY part_id;'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching parts:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getPartById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM part_master WHERE part_id = $1;',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching part:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// UPDATE
exports.updatePart = async (req, res) => {
  const { id } = req.params;
  const {
    part_name,
    part_name_code,
    drawing_no_revision,
    customer,
    product_family,
    material,
    part_weight_dimensions,
    max_production_per_day,
    takt_time
  } = req.body;

  let cad_design_upload;

  if (req.file) {
    // new file uploaded → delete old
    await deleteOldFile(id);
    cad_design_upload = req.file.path;
  } else {
    // keep existing path
    const { rows } = await pool.query(
      'SELECT cad_design_upload FROM part_master WHERE part_id = $1;',
      [id]
    );
    cad_design_upload = rows[0]?.cad_design_upload || null;
  }

  try {
    const { rows } = await pool.query(
      `UPDATE part_master SET
         part_name                = $1,
         part_name_code           = $2,
         drawing_no_revision      = $3,
         customer                 = $4,
         product_family           = $5,
         material                 = $6,
         part_weight_dimensions   = $7,
         cad_design_upload        = $8,
         max_production_per_day   = $9,
         takt_time                = $10,
         updated_at               = NOW()
       WHERE part_id = $11
       RETURNING *;`,
      [
        part_name,
        part_name_code,
        drawing_no_revision,
        customer,
        product_family,
        material,
        part_weight_dimensions,
        cad_design_upload,
        max_production_per_day,
        takt_time,
        id
      ]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating part:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// DELETE
exports.deletePart = async (req, res) => {
  const { id } = req.params;
  try {
    // delete file from disk
    await deleteOldFile(id);

    const result = await pool.query(
      'DELETE FROM part_master WHERE part_id = $1;',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Not found.' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting part:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};
