const pool = require('../db');

// exports.getAllMonitoringData = async (req, res) => {
//   const { machineType } = req.params;
//   const tableName = `ORG001_${machineType}_MonitoringDataLog`;

//   try {
//     const result = await pool.query(`SELECT * FROM "${tableName}" ORDER BY "createdAt" DESC`);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching monitoring data', error: error.message });
//   }
// };


// controller/monitoringController.js
// const pool = require('../db');

// exports.getAllMonitoringData = async (req, res) => {
//   const { machineType } = req.params;
//   const daysParam      = parseInt(req.query.days, 10) || 1;
//   const paramPrefix    = req.query.parameter;

//   // 1) Choose bucket interval
//   let bucketInterval;
//   if (daysParam <= 1)       bucketInterval = '1 minute';
//   else if (daysParam <= 7)  bucketInterval = '15 minutes';
//   else if (daysParam <= 30) bucketInterval = '1 hour';
//   else if (daysParam <= 180)bucketInterval = '12 hours';
//   else                      bucketInterval = '1 day';

//   // 2) Build filters
//   const whereClauses = [
//     `COALESCE("datetime","createdAt") >= NOW() - INTERVAL '${daysParam} day'`
//   ];
//   const values = [];
//   let idx = 1;

//   if (paramPrefix) {
//     whereClauses.push(`"ParameterName" ILIKE $${idx}`);
//     values.push(`${paramPrefix}%`);
//     idx++;
//   }

//   const whereSQL = `WHERE ${whereClauses.join(' AND ')}`;

//   // 3) Table name (validate machineType in production!)
//   const tableName = `ORG001_${machineType}_MonitoringDataLog`;

//   // 4) Aggregation query with ParameterName, min, max, avg
//   const sql = `
//     SELECT
//       "ParameterName",
//       time_bucket('${bucketInterval}', COALESCE("datetime","createdAt")) AS bucket,
//       MIN(("ParameterValue")::numeric)                       AS min_value,
//       MAX(("ParameterValue")::numeric)                       AS max_value,
//       AVG(("ParameterValue")::numeric)                       AS avg_value
//     FROM "${tableName}"
//     ${whereSQL}
//     GROUP BY "ParameterName", bucket
//     ORDER BY "ParameterName", bucket;
//   `;

//   try {
//     const { rows } = await pool.query(sql, values);
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching aggregated data:', err);
//     res.status(500).json({
//       message: 'Error fetching aggregated monitoring data',
//       error: err.message
//     });
//   }
// };

exports.getAllMonitoringData = async (req, res) => {
  const { machineType }   = req.params;
  const daysParam         = parseInt(req.query.days, 10) || 1;
  const paramPrefix       = req.query.parameter || null;

  const sql    = `SELECT * FROM public.get_monitoring_data($1, $2, $3);`;
  const values = [machineType, daysParam, paramPrefix];

  try {
    const { rows } = await pool.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Error fetching data', error: err.message });
  }
};


exports.getLatestMonitoringData = async (req, res) => {
  const { machineType } = req.params;
  const tableName = `ORG001_${machineType}_MonitoringDataLog`;

  try {
    // Grab the latest 16 entries
    const sql = `
      SELECT *
      FROM "${tableName}"
      ORDER BY "createdAt" DESC
      LIMIT 14
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching latest monitoring data:', error);
    res.status(500).json({
      message: 'Error fetching latest monitoring data',
      error: error.message
    });
  }
};
