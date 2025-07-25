const { Pool } = require('pg');
const pool = new Pool;

const moment = require('moment-timezone');

const normalizeToMinute = (timestamp) => {
  return moment(timestamp).startOf('minute').toISOString();
};

async function logDowntimeForMachine(machine_id) {
  try {
    const runningPlanQuery = `SELECT plan_id, shift_no FROM planentry WHERE machine_id = $1 AND status = 'Running' LIMIT 1`;
    const planResult = await pool.query(runningPlanQuery, [machine_id]);

    if (planResult.rows.length === 0) {
      console.log(`ℹ️ No running plan for machine ${machine_id}`);
      return;
    }

    const { plan_id, shift_no } = planResult.rows[0];

    const statusQuery = `
      SELECT machine_id, shift_no, is_available, created_at
      FROM machine_status
      WHERE machine_id = $1 AND plan_id = $2
      ORDER BY created_at ASC
    `;
    const { rows: machineStatuses } = await pool.query(statusQuery, [machine_id, plan_id]);
    if (!machineStatuses.length) return;

    const shiftStartIST = moment.tz(machineStatuses[0].created_at, 'Asia/Kolkata').startOf('day').add(shift_no === 1 ? 8 : 16, 'hours');
    const shiftEndIST = shiftStartIST.clone().add(8, 'hours');

    const shiftStartUTC = shiftStartIST.clone().utc();
    const shiftEndUTC = shiftEndIST.clone().utc();
    const shiftEndMinusOneUTC = shiftEndUTC.clone().subtract(1, 'minute');
    const nowUTC = moment().utc();
    const shiftDate = shiftStartIST.format('YYYY-MM-DD');

    const significantDowntimes = [];

    const startupDiffSec = moment(machineStatuses[0].created_at).diff(shiftStartUTC, 'seconds');
    if (startupDiffSec >= 120) {
      significantDowntimes.push({
        start: shiftStartUTC.toDate(),
        end: machineStatuses[0].created_at,
        reason: "Start-Up Losses",
        category: "Availability",
        linked: "Startup loss before first signal",
        durationMins: Math.floor(startupDiffSec / 60),
        plan_id
      });
    }

    for (let i = 0; i < machineStatuses.length - 1; i++) {
      const current = machineStatuses[i];
      const next = machineStatuses[i + 1];

      if (!current.is_available && next.is_available) {
        const gapSec = moment(next.created_at).diff(moment(current.created_at), 'seconds');
        if (gapSec >= 120) {
          const reason = gapSec <= 300 ? "Idling & Minor Stoppages" : "Unplanned";
          const linked = gapSec <= 300 ? "Short stop" : "Unplanned downtime";

          significantDowntimes.push({
            start: current.created_at,
            end: next.created_at,
            reason,
            category: "Availability",
            linked,
            durationMins: Math.floor(gapSec / 60),
            plan_id
          });
        }
      }
    }

    const last = machineStatuses[machineStatuses.length - 1];
    if (nowUTC.isSame(shiftEndMinusOneUTC, 'minute')) {
      const shutdownDiff = shiftEndUTC.diff(moment(last.created_at), 'seconds');
      if (shutdownDiff >= 120) {
        significantDowntimes.push({
          start: last.created_at,
          end: shiftEndUTC.toDate(),
          reason: "Shutdown Losses",
          category: "Availability",
          linked: "Loss at end of shift",
          durationMins: Math.floor(shutdownDiff / 60),
          plan_id
        });
      }
    }

    for (const entry of significantDowntimes) {
      const start = normalizeToMinute(entry.start);
      const end = normalizeToMinute(entry.end);

      const existsQuery = `SELECT 1 FROM downtime WHERE machine_id = $1 AND shift_no = $2 AND end_timestamp = $3 AND plan_id = $4 AND date = $5 LIMIT 1`;
      const exists = await pool.query(existsQuery, [machine_id, shift_no, end, plan_id, shiftDate]);
      if (exists.rows.length > 0) continue;

      const insertQuery = `
        INSERT INTO downtime (
          machine_id, shift_no, start_timestamp, end_timestamp,
          downtime_reason, duration, status, category, linked,
          remark, date, plan_id
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, true, $7, $8,
          '', $9, $10
        )
      `;
      await pool.query(insertQuery, [
        machine_id,
        shift_no,
        start,
        end,
        entry.reason,
        entry.durationMins,
        entry.category,
        entry.linked,
        shiftDate,
        plan_id
      ]);
    }
  } catch (err) {
    console.error(`❌ Error in downtime for machine ${machine_id}:`, err.message);
  }
}

async function logDowntimeForAllRunningMachines() {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT machine_id FROM planentry WHERE status = 'Running'`);
    for (const row of rows) {
      await logDowntimeForMachine(row.machine_id);
    }
  } catch (err) {
    console.error('❌ Error fetching machines for downtime:', err.message);
  }
}

module.exports = { logDowntimeForAllRunningMachines };
