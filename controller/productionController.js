const pool = require('../db');

exports.getAllProductionData = async (req, res) => {
  const { machineType } = req.params;
  const tableName = `ORG001_${machineType}_productionData`;

  try {
    const result = await pool.query(`SELECT * FROM "${tableName}" ORDER BY "createdAt" DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching production data', error: error.message });
  }
};
