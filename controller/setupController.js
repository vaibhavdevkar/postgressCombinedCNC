const pool = require('../db');

// CREATE
exports.createSetup = async (req, res) => {
  const {
    part_id,
    machine_id,
    process_id,
    step_no,
    checklist_item_description,
    type,
    boolean_expected_value,
    spec_target_value,
    spec_min_tolerance,
    spec_max_tolerance,
    unit,
    validation_method,
    mandatory,
    production_part_count,
    quality_part_count
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO setup_master
        (part_id, machine_id, process_id, step_no,
         checklist_item_description, type, boolean_expected_value,
         spec_target_value, spec_min_tolerance, spec_max_tolerance,
         unit, validation_method, mandatory,
         production_part_count, quality_part_count)
       VALUES
        ($1,$2,$3,$4,
         $5,$6,$7,
         $8,$9,$10,
         $11,$12,$13,
         $14,$15)
       RETURNING *;`,
      [
        part_id,
        machine_id,
        process_id,
        step_no,
        checklist_item_description,
        type,
        boolean_expected_value,
        spec_target_value,
        spec_min_tolerance,
        spec_max_tolerance,
        unit,
        validation_method,
        mandatory,
        production_part_count,
        quality_part_count
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating setup:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ALL
exports.getAllSetups = async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM setup_master ORDER BY setup_id;'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching setups:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// READ ONE
exports.getSetupById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM setup_master WHERE setup_id = $1;',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching setup:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// UPDATE
exports.updateSetup = async (req, res) => {
  const { id } = req.params;
  const {
    part_id,
    machine_id,
    process_id,
    step_no,
    checklist_item_description,
    type,
    boolean_expected_value,
    spec_target_value,
    spec_min_tolerance,
    spec_max_tolerance,
    unit,
    validation_method,
    mandatory,
    production_part_count,
    quality_part_count
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE setup_master SET
         part_id                   = $1,
         machine_id                = $2,
         process_id                = $3,
         step_no                   = $4,
         checklist_item_description= $5,
         type                      = $6,
         boolean_expected_value    = $7,
         spec_target_value         = $8,
         spec_min_tolerance        = $9,
         spec_max_tolerance        = $10,
         unit                      = $11,
         validation_method         = $12,
         mandatory                 = $13,
         production_part_count     = $14,
         quality_part_count        = $15,
         updated_at                = NOW()
       WHERE setup_id = $16
       RETURNING *;`,
      [
        part_id,
        machine_id,
        process_id,
        step_no,
        checklist_item_description,
        type,
        boolean_expected_value,
        spec_target_value,
        spec_min_tolerance,
        spec_max_tolerance,
        unit,
        validation_method,
        mandatory,
        production_part_count,
        quality_part_count,
        id
      ]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating setup:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};

// DELETE
exports.deleteSetup = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM setup_master WHERE setup_id = $1;',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Not found.' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting setup:', err);
    res.status(500).json({ message: 'Database error.' });
  }
};
