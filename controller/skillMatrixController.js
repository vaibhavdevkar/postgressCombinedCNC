
const pool = require('../db');
const fs   = require('fs');

// Helper to delete old upload file
async function deleteOldFile(id) {
  const { rows } = await pool.query(
    'SELECT document_upload FROM skill_matrix WHERE skill_matrix_id=$1',
    [id]
  );
  if (rows[0]?.document_upload) {
    fs.unlink(rows[0].document_upload, ()=>{});
  }
}

// CREATE
exports.createSkillMatrix = async (req, res) => {
  const {
    user_id,
    skill_id,
    machine_id,
    part_id,
    process_id,
    skill_role,
    skill_level,
    certified_by,
    certified_on,
    valid_till
  } = req.body;
  const document_upload = req.file?.path || null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO skill_matrix
        (
          user_id, skill_id,
          machine_id, part_id, process_id,
          skill_role, skill_level,
          certified_by, certified_on, valid_till,
          document_upload
        )
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *;`,
      [
        user_id,
        skill_id,
        machine_id || null,
        part_id    || null,
        process_id || null,
        skill_role,
        skill_level,
        certified_by,
        certified_on,
        valid_till,
        document_upload
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (document_upload) fs.unlink(document_upload, ()=>{});
    console.error(err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
// exports.getAllSkills = async (_, res) => {
//   try {
//     const { rows } = await pool.query(
//       `SELECT sm.*,
//               u.full_name      AS user_name,
//               c.skill_name     AS skill_name,
//               mm.machine_name  AS machine_name
//        FROM skill_matrix sm
//        JOIN user_master u      ON sm.user_id    = u.user_id
//        JOIN skill_catalog c    ON sm.skill_id   = c.skill_id
//        LEFT JOIN machine_master mm ON sm.machine_id = mm.machine_id
//        ORDER BY sm.skill_matrix_id;`
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Database error.' });
//   }
// };

exports.getAllSkills = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM skill_matrix
       ORDER BY skill_matrix_id;`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getSkillById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT sm.*,
              u.full_name  AS user_name,
              c.skill_name AS skill_name,
              mm.machine_name
       FROM skill_matrix sm
       JOIN user_master u      ON sm.user_id    = u.user_id
       JOIN skill_catalog c    ON sm.skill_id   = c.skill_id
       LEFT JOIN machine_master mm ON sm.machine_id = mm.machine_id
       WHERE sm.skill_matrix_id = $1;`,
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
exports.updateSkillMatrix = async (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    skill_id,
    machine_id,
    part_id,
    process_id,
    skill_role,
    skill_level,
    certified_by,
    certified_on,
    valid_till
  } = req.body;

  let document_upload;
  if (req.file) {
    await deleteOldFile(id);
    document_upload = req.file.path;
  } else {
    const { rows } = await pool.query(
      'SELECT document_upload FROM skill_matrix WHERE skill_matrix_id=$1',
      [id]
    );
    document_upload = rows[0]?.document_upload || null;
  }

  try {
    const { rows } = await pool.query(
      `UPDATE skill_matrix SET
         user_id         = $1,
         skill_id        = $2,
         machine_id      = $3,
         part_id         = $4,
         process_id      = $5,
         skill_role      = $6,
         skill_level     = $7,
         certified_by    = $8,
         certified_on    = $9,
         valid_till      = $10,
         document_upload = $11,
         updated_at      = NOW()
       WHERE skill_matrix_id = $12
       RETURNING *;`,
      [
        user_id,
        skill_id,
        machine_id || null,
        part_id    || null,
        process_id || null,
        skill_role,
        skill_level,
        certified_by,
        certified_on,
        valid_till,
        document_upload,
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
exports.deleteSkillMatrix = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteOldFile(id);
    const result = await pool.query(
      'DELETE FROM skill_matrix WHERE skill_matrix_id = $1;',
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
