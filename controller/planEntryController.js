const pool = require('../db');

// GET all plan entries
exports.getAllPlanEntries = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM planentry ORDER BY plan_id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching plan entries:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET plan entry by ID
exports.getPlanEntryById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM planentry WHERE plan_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan entry not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching plan entry by ID:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// GET plan entries where status is 'Running' for a specific machine_id
exports.getRunningPlansByMachineId = async (req, res) => {
  const { machine_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM planentry WHERE machine_id = $1 AND status = $2 ORDER BY plan_id DESC',
      [machine_id, 'Running']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No running plans found for the specified machine ID.' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching running plans:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


