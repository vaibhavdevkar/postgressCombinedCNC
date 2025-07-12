// controller/maintenanceScheduleController.js
const pool = require('../db');

exports.createMaintenanceSchedule = async (req, res) => {
  try {
    const {
      machine_id,
      maintenance_type,
      maintenance_name,
      frequency,
      trigger_type,
      last_calendar_date,
      next_cycle,
      last_count,
      next_count,
      pmc_parameter_id,
      is_critical,
      estimated_duration_mins,
      assigned_role,
      status,
      documentation,
      auto_alert_required,
      escalation_level,
      pm_schedule_date,
      next_schedule_date
    } = req.body;

    const result = await pool.query(
      `INSERT INTO maintenance_schedule (
        machine_id, maintenance_type, maintenance_name, frequency, trigger_type,
        last_calendar_date, next_cycle, last_count, next_count, pmc_parameter_id,
        is_critical, estimated_duration_mins, assigned_role, status, documentation,
        auto_alert_required, escalation_level, pm_schedule_date, next_schedule_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING *`,
      [
        machine_id, maintenance_type, maintenance_name, frequency, trigger_type,
        last_calendar_date, next_cycle, last_count, next_count, pmc_parameter_id,
        is_critical, estimated_duration_mins, assigned_role, status, documentation,
        auto_alert_required, escalation_level, pm_schedule_date, next_schedule_date
      ]
    );
    res.status(201).json(result.rows[0]);
    console.log("");
    
  } catch (error) {
    res.status(500).json({ message: 'Error creating schedule', error: error.message });
  }
};

exports.getAllMaintenanceSchedules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_schedule ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
};

exports.getMaintenanceScheduleById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_schedule WHERE maintenance_id = $1', [req.params.id]);
    result.rows.length ? res.json(result.rows[0]) : res.status(404).json({ message: 'Not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedule', error: error.message });
  }
};

exports.updateMaintenanceSchedule = async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `UPDATE maintenance_schedule SET ${setClause}, updated_at = NOW() WHERE maintenance_id = $${fields.length + 1} RETURNING *;`;
    values.push(req.params.id);

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule', error: error.message });
  }
};

exports.deleteMaintenanceSchedule = async (req, res) => {
  try {
    await pool.query('DELETE FROM maintenance_schedule WHERE maintenance_id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
};
