const pool = require("../db");

exports.getMachineAverageData = async (req, res) => {
  let machineData = {
    machine_ids: [],
    machineCount: 0,
    machineDetails: [],
    averageMetrics: {
      OEE: 0, defectiveParts: 0, availability: 0, performance: 0,
      quality: 0, TotalPartsProduced: 0, machineUtilization: 0,
      downtimeDuration: 0, operatingTime: 0, expectedPartCount: 0, partBehind: 0
    }
  };

  let failedMachines = [];

  try {
    // Step 1: Fetch bottleneck machine full data from Timescale/PostgreSQL
    const bottleneckQuery = `SELECT * FROM machine_master WHERE bottleneck ILIKE 'bottleneck'`;
    const bottleneckResult = await pool.query(bottleneckQuery);
    const bottleneckMachines = bottleneckResult.rows;

    if (!bottleneckMachines || bottleneckMachines.length === 0) {
      return res.status(400).json({ message: "No bottleneck machines available." });
    }

    const bottleneckIds = bottleneckMachines.map(row => row.machine_id);
    machineData.machineDetails = bottleneckMachines;

    // Step 2: Fetch latest OEE log for each machine from oee_log (TimescaleDB)
    const machinePromises = bottleneckIds.map(async (machine_id) => {
      try {
        const query = `SELECT * FROM oee_log WHERE machine_id = $1 ORDER BY "createdAt" DESC LIMIT 1`;
        const result = await pool.query(query, [machine_id]);
        if (result.rows.length === 0) throw new Error("No data found");
        return { status: "success", machineId: machine_id, data: result.rows[0] };
      } catch (error) {
        failedMachines.push(machine_id);
        return { status: "failed", machineId: machine_id };
      }
    });

    const results = await Promise.all(machinePromises);
    const successfulMachines = results.filter(result => result.status === "success" && result.data);

    if (successfulMachines.length === 0) {
      return res.status(400).json({ message: "No machine data fetched." });
    }

    // Step 3: Accumulate values and compute averages
    let machineCount = 0;
    let totalMetrics = {
      OEE: 0, defectiveParts: 0, availability: 0, performance: 0,
      quality: 0, TotalPartsProduced: 0, machineUtilization: 0,
      downtimeDuration: 0, operatingTime: 0, expectedPartCount: 0, partBehind: 0
    };

    successfulMachines.forEach((result) => {
      const data = result.data;
      machineData.machine_ids.push(result.machineId);

      totalMetrics.OEE += parseFloat(data.OEE || 0);
      totalMetrics.defectiveParts += parseFloat(data.defectiveParts || 0);
      totalMetrics.availability += parseFloat(data.availability || 0);
      totalMetrics.performance += parseFloat(data.performance || 0);
      totalMetrics.quality += parseFloat(data.quality || 0);
      totalMetrics.TotalPartsProduced += parseFloat(data.TotalPartsProduced || 0);
      totalMetrics.machineUtilization += parseFloat(data.machineUtilization || 0);
      totalMetrics.downtimeDuration += parseFloat(data.downtimeDuration || 0);
      totalMetrics.operatingTime += parseFloat(data.operatingTime || 0);
      totalMetrics.expectedPartCount += parseFloat(data.expectedPartCount || 0);
      totalMetrics.partBehind += parseFloat(data.partBehind || 0);

      machineCount++;
    });

    // Step 4: Calculate averages
    if (machineCount > 0) {
      machineData.machineCount = machineCount;
      machineData.averageMetrics = {
        OEE: (totalMetrics.OEE / machineCount).toFixed(2),
        defectiveParts: (totalMetrics.defectiveParts / machineCount).toFixed(2),
        availability: (totalMetrics.availability / machineCount).toFixed(2),
        performance: (totalMetrics.performance / machineCount).toFixed(2),
        quality: (totalMetrics.quality / machineCount).toFixed(2),
        TotalPartsProduced: (totalMetrics.TotalPartsProduced / machineCount).toFixed(2),
        machineUtilization: (totalMetrics.machineUtilization / machineCount).toFixed(2),
        downtimeDuration: (totalMetrics.downtimeDuration / machineCount).toFixed(2),
        operatingTime: (totalMetrics.operatingTime / machineCount).toFixed(2),
        expectedPartCount: (totalMetrics.expectedPartCount / machineCount).toFixed(2),
        partBehind: (totalMetrics.partBehind / machineCount).toFixed(2)
      };
    }

    return res.json({
      message: "✅ Machine data processed successfully.",
      machineData,
      failedMachines
    });
  } catch (error) {
    console.error("❌ Error fetching machine data:", error);
    return res.status(500).json({ message: "Error fetching machine data", error: error.message });
  }
};