
const pool = require('../db');

// Retrieve all tools
exports.getAllTools = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.tool_master');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tools:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve one tool by ID
exports.getToolById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM public.tool_master WHERE tool_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching tool:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new tool, handling file upload for tool_drawing_upload
exports.createTool = async (req, res) => {
  const {
    tool_name,
    tool_type,
    machine_id,
    part_id,
    tool_number,
    tool_life_limit,
    tool_usage_counter,
    tool_change_threshold,
    last_change_date,
    tool_manufacturer_code,
    tool_calibration_required,
    tool_calibration_freq,
    tool_holder_type,
    status,
    tool_wear_monitoring,
    tool_usage_count,
    remaining_life_percent,
    total_tools_used_till,
    last_replacement_date,
    tool_health_status,
    replacement_reason,
    alert_threshold,
    offset_no,
    nominal_offset_value,
    last_applied_offset,
    offset_delta,
    tool_wear_percent
  } = req.body;
  const tool_drawing_upload = req.file ? req.file.path : null;

  try {
    const insertQuery = `
      INSERT INTO public.tool_master (
        tool_name,
        tool_type,
        machine_id,
        part_id,
        tool_number,
        tool_life_limit,
        tool_usage_counter,
        tool_change_threshold,
        last_change_date,
        tool_drawing_upload,
        tool_manufacturer_code,
        tool_calibration_required,
        tool_calibration_freq,
        tool_holder_type,
        status,
        tool_wear_monitoring,
        tool_usage_count,
        remaining_life_percent,
        total_tools_used_till,
        last_replacement_date,
        tool_health_status,
        replacement_reason,
        alert_threshold,
        offset_no,
        nominal_offset_value,
        last_applied_offset,
        offset_delta,
        tool_wear_percent
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28
      ) RETURNING *;
    `;
    const values = [
      tool_name,
      tool_type,
      machine_id,
      part_id,
      tool_number,
      tool_life_limit,
      tool_usage_counter,
      tool_change_threshold,
      last_change_date,
      tool_drawing_upload,
      tool_manufacturer_code,
      tool_calibration_required,
      tool_calibration_freq,
      tool_holder_type,
      status,
      tool_wear_monitoring,
      tool_usage_count,
      remaining_life_percent,
      total_tools_used_till,
      last_replacement_date,
      tool_health_status,
      replacement_reason,
      alert_threshold,
      offset_no,
      nominal_offset_value,
      last_applied_offset,
      offset_delta,
      tool_wear_percent
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating tool:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing tool, optionally handling new drawing upload
exports.updateTool = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (req.file) updates.tool_drawing_upload = req.file.path;

  const setClauses = [];
  const values = [];
  let idx = 1;
  for (const key in updates) {
    setClauses.push(`${key} = $${idx}`);
    values.push(updates[key]);
    idx++;
  }
  values.push(id);

  const updateQuery = `
    UPDATE public.tool_master
    SET ${setClauses.join(', ')}
    WHERE tool_id = $${idx}
    RETURNING *;
  `;

  try {
    const result = await pool.query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating tool:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a tool by ID
exports.deleteTool = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM public.tool_master WHERE tool_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json({ message: 'Tool deleted successfully' });
  } catch (err) {
    console.error('Error deleting tool:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getToolByMachineId = async (req, res) => {
  const { machine_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM public.tool_master WHERE machine_id = $1',
      [machine_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No tool found for this machine' });
    }
    res.json(result.rows); // Return all tools for the given machine
  } catch (err) {
    console.error('Error fetching tool by machine_id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};