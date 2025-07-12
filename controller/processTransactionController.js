const pool = require('../db');

// CREATE
exports.createProcessTransaction = async (req, res) => {
  const {
    machine_id,
    part_id,
    serial_number_or_vin,
    process_id,
    operation_timestamp,
    tool_id,
    tool_result,
    torque_angle_force_value,
    operator_id,
    shift_id,
    confirmation_type,
    sop_version_id,
    work_order_id,
    rework_flag,
    remarks,
    confirmation_status
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO public.process_transaction (
         machine_id,
         part_id,
         serial_number_or_vin,
         process_id,
         operation_timestamp,
         tool_id,
         tool_result,
         torque_angle_force_value,
         operator_id,
         shift_id,
         confirmation_type,
         sop_version_id,
         work_order_id,
         rework_flag,
         remarks,
         confirmation_status
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,$8,
         $9,$10,$11,$12,
         $13,$14,$15,$16
       )
       RETURNING *`,
      [
        machine_id,
        part_id,
        serial_number_or_vin,
        process_id,
        operation_timestamp,
        tool_id,
        tool_result,
        torque_angle_force_value,
        operator_id,
        shift_id,
        confirmation_type,
        sop_version_id,
        work_order_id,
        rework_flag,
        remarks,
        confirmation_status
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating process transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ ALL
exports.getAllProcessTransactions = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM public.process_transaction ORDER BY transaction_id`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching process transactions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ ONE
exports.getProcessTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM public.process_transaction WHERE transaction_id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Process transaction not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching process transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE
exports.updateProcessTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    machine_id,
    part_id,
    serial_number_or_vin,
    process_id,
    operation_timestamp,
    tool_id,
    tool_result,
    torque_angle_force_value,
    operator_id,
    shift_id,
    confirmation_type,
    sop_version_id,
    work_order_id,
    rework_flag,
    remarks,
    confirmation_status
  } = req.body;

  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE public.process_transaction SET
         machine_id                = $1,
         part_id                   = $2,
         serial_number_or_vin      = $3,
         process_id                = $4,
         operation_timestamp       = $5,
         tool_id                   = $6,
         tool_result               = $7,
         torque_angle_force_value  = $8,
         operator_id               = $9,
         shift_id                  = $10,
         confirmation_type         = $11,
         sop_version_id            = $12,
         work_order_id             = $13,
         rework_flag               = $14,
         remarks                   = $15,
         confirmation_status       = $16
       WHERE transaction_id = $17
       RETURNING *`,
      [
        machine_id,
        part_id,
        serial_number_or_vin,
        process_id,
        operation_timestamp,
        tool_id,
        tool_result,
        torque_angle_force_value,
        operator_id,
        shift_id,
        confirmation_type,
        sop_version_id,
        work_order_id,
        rework_flag,
        remarks,
        confirmation_status,
        id
      ]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Process transaction not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating process transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE
exports.deleteProcessTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM public.process_transaction WHERE transaction_id = $1`,
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Process transaction not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting process transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};