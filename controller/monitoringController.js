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

// belwo code is working fine 

// exports.getAllMonitoringData = async (req, res) => {
//   const { machineType } = req.params;
//   const daysParam      = parseInt(req.query.days, 10) || 1;
//   const paramPrefix    = req.query.parameter;

//   // 1) Choose bucket interval
//   let bucketInterval;
//   if (daysParam <= 1)        bucketInterval = '1 minute';
//   else if (daysParam <= 7)   bucketInterval = '15 minutes';
//   else if (daysParam <= 30)  bucketInterval = '1 hour';
//   else if (daysParam <= 180) bucketInterval = '12 hours';
//   else                       bucketInterval = '1 day';

//   // 2) Build dynamic WHERE clauses
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

//   // 3) Dynamic table name exactly as created (mixed‑case)
//   const rawTableName = `ORG001_${machineType}_MonitoringDataLog`;

//   try {
//     // 4) Check table existence via to_regclass (handles quoted names)
//     const existsSql   = `SELECT to_regclass($1) AS tbl;`;
//     const existsParam = `"public"."${rawTableName}"`;
//     const existsRes   = await pool.query(existsSql, [existsParam]);

//     if (!existsRes.rows[0].tbl) {
//       return res
//         .status(404)
//         .json({ message: `No data table found for machineType="${machineType}"` });
//     }

//     // 5) Aggregation query
//     const aggSql = `
//       SELECT
//         "ParameterName",
//         time_bucket('${bucketInterval}', COALESCE("datetime","createdAt")) AS bucket,
//         MIN(("ParameterValue")::numeric) AS min_value,
//         MAX(("ParameterValue")::numeric) AS max_value,
//         AVG(("ParameterValue")::numeric) AS avg_value
//       FROM "${rawTableName}"
//       ${whereSQL}
//       GROUP BY "ParameterName", bucket
//       ORDER BY "ParameterName", bucket;
//     `;
//     const { rows } = await pool.query(aggSql, values);
//     return res.json(rows);

//   } catch (err) {
//     console.error('Error in getAllMonitoringData:', err);
//     return res.status(500).json({
//       message: 'Error fetching aggregated monitoring data',
//       error: err.message
//     });
//   }
// };


// exports.getAllMonitoringData = async (req, res) => {
//   const { machineType }   = req.params;
//   const daysParam         = parseInt(req.query.days, 10) || 1;
//   const paramPrefix       = req.query.parameter || null;

//   const sql    = `SELECT * FROM public.get_monitoring_data($1, $2, $3);`;
//   const values = [machineType, daysParam, paramPrefix];

//   try {
//     const { rows } = await pool.query(sql, values);
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching data:', err);
//     res.status(500).json({ message: 'Error fetching data', error: err.message });
//   }
// };


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


// exports.getAllMonitoringData = async (req, res) => {
//   const { machineType } = req.params;
//   const days = parseInt(req.query.days, 10) || 1;
//   const parameterPrefix = req.query.parameter;

//   // 1) Determine time bucket interval
//   const bucketInterval =
//     days <= 1 ? '1 minute' :
//     days <= 7 ? '15 minutes' :
//     days <= 30 ? '1 hour' :
//     days <= 180 ? '12 hours' : '1 day';

//   // 2) Table name
//   const tableName = `ORG001_${machineType}_MonitoringDataLog`;
//   const qualifiedTable = `"public"."${tableName}"`;

//   // 3) Prepare WHERE clause and query values
//   const whereClauses = [
//     `COALESCE("datetime", "createdAt") >= NOW() - INTERVAL '${days} day'`
//   ];
//   const queryParams = [];
//   let paramIndex = 1;

//   if (parameterPrefix) {
//     whereClauses.push(`"ParameterName" ILIKE $${paramIndex++}`);
//     queryParams.push(`${parameterPrefix}%`);
//   }

//   const whereSQL = `WHERE ${whereClauses.join(' AND ')}`;

//   try {
//     // 4) Check if the table exists
//     const tableCheckQuery = `SELECT to_regclass($1) AS tbl;`;
//     const tableCheckRes = await pool.query(tableCheckQuery, [qualifiedTable]);

//     if (!tableCheckRes.rows[0].tbl) {
//       return res.status(404).json({
//         message: `No data table found for machineType="${machineType}"`
//       });
//     }

//     // 5) Aggregation query with time_bucket
//     const aggregationQuery = `
//       SELECT
//         "ParameterName",
//         time_bucket('${bucketInterval}', COALESCE("datetime", "createdAt")) AS bucket,
//         MIN(("ParameterValue")::numeric) AS min_value,
//         MAX(("ParameterValue")::numeric) AS max_value,
//         AVG(("ParameterValue")::numeric) AS avg_value
//       FROM "${tableName}"
//       ${whereSQL}
//       GROUP BY "ParameterName", bucket
//       ORDER BY "ParameterName", bucket;
//     `;

//     const { rows } = await pool.query(aggregationQuery, queryParams);
//     return res.json(rows);

//   } catch (err) {
//     console.error('Error in getAllMonitoringData:', err);
//     return res.status(500).json({
//       message: 'Error fetching aggregated monitoring data',
//       error: err.message
//     });
//   }
// };


exports.getAllMonitoringData = async (req, res) => {
  const { machineType } = req.params;
  // Ensure 'days' is a positive integer, defaulting to 1
  const days = Math.max(1, parseInt(req.query.days, 10) || 1);
  const parameterPrefix = req.query.parameter;

  // 1) Determine time bucket interval
  // Using a switch or if-else if ladder for clarity
  let bucketInterval;
  if (days <= 1) {
    bucketInterval = '1 minute';
  } else if (days <= 7) {
    bucketInterval = '15 minutes';
  } else if (days <= 30) {
    bucketInterval = '1 hour';
  } else if (days <= 180) {
    bucketInterval = '12 hours';
  } else {
    bucketInterval = '1 day';
  }

  // 2) Table name - directly use template literal for clarity, and ensure proper quoting
  // The table name is derived from machineType, so no direct user input risk here for the name itself.
  const tableName = `ORG001_${machineType}_MonitoringDataLog`;
  // SQL identifiers (like table and column names) should be double-quoted if they are
  // case-sensitive or contain special characters.
  // In this case, public is a schema, and tableName is the table name.
  const qualifiedTable = `"public"."${tableName}"`;

  // 3) Prepare WHERE clause and query values
  const whereClauses = [
    `COALESCE("datetime", "createdAt") >= NOW() - INTERVAL '${days} day'`
  ];
  const queryParams = [];

  // Parameterized query for parameterPrefix to prevent SQL injection
  if (parameterPrefix) {
    whereClauses.push(`"ParameterName" ILIKE $1`); // Use $1 as it's the first dynamic parameter
    queryParams.push(`${parameterPrefix}%`);
  }

  const whereSQL = `WHERE ${whereClauses.join(' AND ')}`;

  try {
    // 4) Check if the table exists
    // Use `format` from 'pg-format' if available for dynamic identifiers,
    // otherwise, rely on direct string interpolation for `qualifiedTable`
    // assuming `machineType` is validated or safe.
    // However, `to_regclass` with a parameterized input is generally safe for checking existence.
    const tableCheckQuery = `SELECT to_regclass($1) AS tbl;`;
    const tableCheckRes = await pool.query(tableCheckQuery, [qualifiedTable]);

    if (!tableCheckRes.rows[0].tbl) {
      return res.status(404).json({
        message: `No data table found for machineType="${machineType}". Please check the machine type.`
      });
    }

    // 5) Aggregation query with time_bucket
    // It's crucial to ensure `tableName` is safely incorporated as it's part of the SQL structure.
    // Since `tableName` is constructed from `machineType` (an Express param), it's generally
    // considered safe from direct user SQL injection, but always good to be mindful.
    const aggregationQuery = `
      SELECT
        "ParameterName",
        time_bucket('${bucketInterval}', COALESCE("datetime", "createdAt")) AS bucket,
        MIN(("ParameterValue")::numeric) AS min_value,
        MAX(("ParameterValue")::numeric) AS max_value,
        AVG(("ParameterValue")::numeric)::numeric(10,2) AS avg_value
      FROM "${tableName}"
      ${whereSQL}
      GROUP BY "ParameterName", bucket
      ORDER BY "ParameterName", bucket;
    `;

    // Execute the main aggregation query with the prepared parameters
    const { rows } = await pool.query(aggregationQuery, queryParams);
    return res.json(rows);

  } catch (err) {
    console.error(`Error in getAllMonitoringData for machineType "${machineType}":`, err);
    return res.status(500).json({
      message: 'Failed to retrieve aggregated monitoring data due to an internal server error.',
      error: err.message,
      // Consider removing `err.message` in production for security reasons
    });
  }
};