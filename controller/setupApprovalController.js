
const pool = require('../db');

// ✅ Create a new setup approval
exports.createSetupApproval = async (req, res) => {
  try {
    let {
      machine_id,
      part_id,
      parameters,
      specification,
      special_characterstic,
      inspection_method,
      remark_by_quality,
      remark_by_user
    } = req.body;

    // ✅ Parse parameters if it's a string
    if (typeof parameters === 'string') {
      try {
        parameters = JSON.parse(parameters);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON format in parameters field' });
      }
    }

    const result = await pool.query(
      `INSERT INTO setup_approvals 
       (machine_id, part_id, parameters, specification, special_characterstic, inspection_method, remark_by_quality, remark_by_user)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        machine_id,
        part_id,
        JSON.stringify(parameters), // ensure valid JSONB
        specification,
        special_characterstic,
        inspection_method,
        remark_by_quality,
        remark_by_user
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all setup approvals
exports.getAllSetupApprovals = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM setup_approvals ORDER BY setup_approval_id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get setup approval by ID
exports.getSetupApprovalById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM setup_approvals WHERE setup_approval_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update setup approval
exports.updateSetupApproval = async (req, res) => {
  const { id } = req.params;
  let {
    machine_id,
    part_id,
    parameters,
    specification,
    special_characterstic,
    inspection_method,
    remark_by_quality,
    remark_by_user
  } = req.body;

  // ✅ Parse parameters if it's a string
  if (typeof parameters === 'string') {
    try {
      parameters = JSON.parse(parameters);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON format in parameters field' });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE setup_approvals 
       SET machine_id = $1, 
           part_id = $2, 
           parameters = $3::jsonb, 
           specification = $4, 
           special_characterstic = $5, 
           inspection_method = $6, 
           remark_by_quality = $7, 
           remark_by_user = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE setup_approval_id = $9
       RETURNING *`,
      [
        machine_id,
        part_id,
        JSON.stringify(parameters), // ensure valid JSONB
        specification,
        special_characterstic,
        inspection_method,
        remark_by_quality,
        remark_by_user,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete setup approval
exports.deleteSetupApproval = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM setup_approvals WHERE setup_approval_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};