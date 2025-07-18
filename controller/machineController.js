const pool = require('../db');

// Register a machine and create dynamic tables
exports.registerMachine = async (req, res) => {
  const {
    machine_name_type,
    make_model,
    controller_make_model,
    installed_date,
    location,
    ip_address,
    communication_protocol,
    tool_count,
    power_rating,
    no_of_spindels,
    no_of_servo,
    no_of_encoder,
    no_of_batteries,
    status,
    bottleneck        // ← newly added
  } = req.body;

  try {
    // Insert into machine_master (now including bottleneck)
    const result = await pool.query(
      `INSERT INTO machine_master (
         machine_name_type,
         make_model,
         controller_make_model,
         installed_date,
         location,
         ip_address,
         communication_protocol,
         tool_count,
         power_rating,
         no_of_spindels,
         no_of_servo,
         no_of_encoder,
         no_of_batteries,
         status,
         bottleneck                 -- ← newly added
       )
       VALUES (
         $1,$2,$3,$4,$5,
         $6,$7,$8,$9,$10,
         $11,$12,$13,$14,$15     -- ← bumped placeholders
       )
       RETURNING *`,
      [
        machine_name_type,
        make_model,
        controller_make_model,
        installed_date,
        location,
        ip_address,
        communication_protocol,
        tool_count,
        power_rating,
        no_of_spindels,
        no_of_servo,
        no_of_encoder,
        no_of_batteries,
        status,
        bottleneck             // ← value for $15
      ]
    );

    const insertedMachine = result.rows[0];
    const machineType = insertedMachine.machine_name_type;
    const orgPrefix = "ORG001";

    const productionTable = `"${orgPrefix}_${machineType}_productionData"`;
    const monitoringTable = `"${orgPrefix}_${machineType}_MonitoringDataLog"`;

    // Create MonitoringDataLog table
await pool.query(`
  CREATE TABLE  ${monitoringTable} (
    "machine_id" INTEGER,
    "machine_name_type" TEXT,
    "ParameterName" TEXT,
    "ParameterNumber" TEXT,
    "ParameterValue" TEXT,
    "createdAt" TIMESTAMP PRIMARY KEY DEFAULT NOW(), -- ✅ make createdAt the primary key
    "EmpId" TEXT,
    shift_no INTEGER,
    datetime TIMESTAMP,
    plan_id INTEGER,
    CONSTRAINT fk_monitoring_machine FOREIGN KEY ("machine_id") REFERENCES machine_master(machine_id),
    CONSTRAINT fk_monitoring_plan FOREIGN KEY ("plan_id") REFERENCES planentry(plan_id)

  );
`);

// Convert to hypertable
await pool.query(`
  SELECT create_hypertable('"${orgPrefix}_${machineType}_MonitoringDataLog"', 'createdAt', if_not_exists => TRUE);
`);


// Create ProductionData table
await pool.query(`
  CREATE TABLE ${productionTable} (
    "machine_id" INTEGER,
    "machine_name_type" TEXT,
    "EmpId" TEXT,
    "createdAt" TIMESTAMP PRIMARY KEY DEFAULT NOW(), -- ✅ again, use createdAt as primary key
    "TotalPartsProduced" INTEGER,
    shift_no INTEGER,
    "actualCount_machine" INTEGER,
    plan_id INTEGER,
    CONSTRAINT fk_production_machine FOREIGN KEY ("machine_id") REFERENCES machine_master(machine_id)  ,
    CONSTRAINT fk_production_plan FOREIGN KEY ("plan_id") REFERENCES planentry(plan_id)
  );
`);

// Convert to hypertable
await pool.query(`
  SELECT create_hypertable('"${orgPrefix}_${machineType}_productionData"', 'createdAt', if_not_exists => TRUE);
`);


    res.status(201).json({
      message: '✅ Machine registered and dynamic tables created.',
      machine: insertedMachine
    });
  } catch (error) {
    console.error("Error in registerMachine:", error);
    res.status(500).json({ error: '❌ Error registering machine', details: error.message });
  }
};

// Get all machine IDs
exports.getAllMachineIds = async (req, res) => {
  try {
    const result = await pool.query('SELECT machine_id FROM machine_master');
    const machineIds = result.rows.map(row => row.machine_id);
    res.status(200).json(machineIds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machine IDs', details: error.message });
  }
};

// Get all machines by location ID
exports.getMachinesByOrganization = async (req, res) => {
  const { organizationId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM machine_master WHERE location = $1', [organizationId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machines', details: error.message });
  }
};

// Get machine by ID
exports.getMachineById = async (req, res) => {
  const { machineId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM machine_master WHERE machine_id = $1', [machineId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machine', details: error.message });
  }
};

// Update machine
// Update machine
exports.updateMachine = async (req, res) => {
  const { machineId } = req.params;
  const {
    machine_name_type,
    make_model,
    controller_make_model,
    installed_date,
    location,
    ip_address,
    communication_protocol,
    tool_count,
    power_rating,
    no_of_spindels,
    no_of_servo,
    no_of_encoder,
    no_of_batteries,
    status,
    bottleneck          // ← newly added
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE machine_master
         SET machine_name_type         = $1,
             make_model                = $2,
             controller_make_model     = $3,
             installed_date           = $4,
             location                 = $5,
             ip_address               = $6,
             communication_protocol   = $7,
             tool_count               = $8,
             power_rating             = $9,
             no_of_spindels           = $10,
             no_of_servo              = $11,
             no_of_encoder            = $12,
             no_of_batteries          = $13,
             status                   = $14,
             bottleneck               = $15,
             updated_at               = NOW()
       WHERE machine_id = $16
       RETURNING *`,
      [
        machine_name_type,
        make_model,
        controller_make_model,
        installed_date,
        location,
        ip_address,
        communication_protocol,
        tool_count,
        power_rating,
        no_of_spindels,
        no_of_servo,
        no_of_encoder,
        no_of_batteries,
        status,
        bottleneck,    // ← value for $15
        machineId      // ← value for $16
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    res.status(200).json({
      message: 'Machine updated successfully',
      machine: result.rows[0]
    });
  } catch (error) {
    console.error("Error in updateMachine:", error);
    res.status(500).json({ message: 'Error updating machine', details: error.message });
  }
};

// Delete machine
exports.deleteMachine = async (req, res) => {
  const { machineId } = req.params;

  try {
    const result = await pool.query('DELETE FROM machine_master WHERE machine_id = $1 RETURNING *', [machineId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    res.status(200).json({ message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting machine', details: error.message });
  }
};

// Count of active machines
exports.getActiveMachinesCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM machine_master WHERE status ILIKE 'ACTIVE'`
    );
    res.status(200).json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ message: 'Error counting active machines', details: error.message });
  }
};

// List of active machine IDs
exports.getActiveMachines = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT machine_id FROM machine_master WHERE status ILIKE 'ACTIVE'`
    );
    const ids = result.rows.map(row => row.machine_id);
    res.status(200).json(ids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active machine IDs', details: error.message });
  }
};

// Count of inactive machines
exports.getInActiveMachinesCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM machine_master WHERE status ILIKE 'INACTIVE'`
    );
    res.status(200).json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ message: 'Error counting inactive machines', details: error.message });
  }
};

// Bottleneck machine IDs
exports.getBottleneckMachineIds = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT machine_id FROM machine_master WHERE machine_name_type ILIKE '%bottleneck%'`
    );
    const ids = result.rows.map(row => row.machine_id);
    res.status(200).json(ids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bottleneck machines', details: error.message });
  }
};



exports.getAllMachine = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM machine_master`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching machines:', error);
    return res
      .status(500)
      .json({
        message: 'Error fetching machines',
        details: error.message
      });
  }
};


exports.getMachinesByLine = async (req, res) => {
  const rawLoc = req.query.location;
  const location = parseInt(rawLoc, 10);

  if (!rawLoc || isNaN(location)) {
    return res
      .status(400)
      .json({ message: 'Invalid or missing query parameter: location' });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM machine_master
      WHERE location = $1
      ORDER BY machine_id ASC
      `,
      [location]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching machines by location:', error);
    return res.status(500).json({
      message: 'Error fetching machines by location',
      details: error.message
    });
  }
}


exports.getBottleneckMachineIds = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT machine_id
         FROM machine_master
        WHERE bottleneck = $1
        ORDER BY machine_id ASC`,
      ['bottleneck']
    );
    // map the rows to an array of ints
    const ids = rows.map(r => r.machine_id);
    return res.status(200).json(ids);
  } catch (error) {
    console.error('Error fetching bottleneck machine IDs:', error);
    return res.status(500).json({
      message: 'Error fetching bottleneck machine IDs',
      details: error.message
    });
  }
};