
const pool = require('../db');
const moment = require('moment-timezone');
const cron = require('node-cron');

moment.tz.setDefault('Asia/Kolkata');

// 1) Pending inserts based on part_id from process_master
async function handlePendingInserts() {
  const now = moment();
  const todayDate = now.format('YYYY-MM-DD');
  console.log(`\n🔄 [${now.format('YYYY-MM-DD HH:mm')}] Checking part-based Active machines for planentry…`);

  const { rows: shifts } = await pool.query(`
    SELECT shift_no, shift_start_time, shift_end_time
    FROM shift_master
  `);

  for (const { shift_no, shift_start_time, shift_end_time } of shifts) {
    let start = moment(`${todayDate} ${shift_start_time}`, 'YYYY-MM-DD HH:mm:ss');
    let end = moment(`${todayDate} ${shift_end_time}`, 'YYYY-MM-DD HH:mm:ss');
    if (end.isBefore(start)) end.add(1, 'day'); // overnight shift

    if (now.isBetween(start, end)) {
      const { rows: activeMachines } = await pool.query(`
        SELECT machine_id FROM machine_master WHERE status = 'Active'
      `);

      for (const { machine_id } of activeMachines) {
        // ✅ Get part_id & cycle_time from process_master
        const { rows: processRows } = await pool.query(`
          SELECT part_id, cycle_time, updated_at
FROM process_master
WHERE machine_id = $1
  AND updated_at::date = CURRENT_DATE
  AND updated_at <= NOW()
ORDER BY updated_at DESC
LIMIT 1

        `, [machine_id]);

        if (!processRows.length) continue;

        const { part_id, cycle_time } = processRows[0];

        // ✅ Get part_name from part_master
        const { rows: partRows } = await pool.query(`
          SELECT part_name FROM part_master WHERE part_id = $1
        `, [part_id]);

        if (!partRows.length) continue;

        const part_name = partRows[0].part_name;

        // ✅ Prevent duplicates
        const { rowCount } = await pool.query(`
          SELECT 1 FROM planentry
          WHERE machine_id = $1 AND shift_no = $2 AND date = $3
        `, [machine_id, shift_no, todayDate]);

        if (rowCount === 0) {
          await pool.query(`
            INSERT INTO planentry (
              part_name, cycle_time, machine_id,
              selected_user, load_unload, status,
              shift_no, date, created_at, updated_at, part_id
            ) VALUES (
              $1, $2, $3,
              '', 0, 'Pending',
              $4, $5, NOW(), NOW(), $6
            )
          `, [
            part_name, cycle_time, machine_id,
            shift_no, todayDate, part_id
          ]);

          console.log(`✅ Inserted planentry: Machine ${machine_id}, Part ${part_id}, Shift ${shift_no}`);
        }
      }
    }
  }
}

// 2) Update status to Running if production data exists
async function updateRunningStatus() {
  const now = moment();
  const todayDate = now.format('YYYY-MM-DD');
  console.log(`\n🔄 [${now.format('YYYY-MM-DD HH:mm')}] Running‑update check…`);

  const { rows: pending } = await pool.query(`
    SELECT DISTINCT pe.plan_id, mm.machine_name_type
    FROM planentry pe
    JOIN machine_master mm ON pe.machine_id = mm.machine_id
    WHERE pe.date = $1 AND pe.status = 'Pending'
  `, [todayDate]);

  if (!pending.length) {
    console.log('⚠️ No Pending entries for Running.');
    return;
  }

  for (const { plan_id, machine_name_type } of pending) {
    const tableRef = `"ORG001_${machine_name_type}_productionData"`;

    const { rows: hit } = await pool.query(`
      SELECT 1
      FROM ${tableRef} pd
      JOIN planentry pm ON pd.plan_id = pm.plan_id AND pm.date = $1
      WHERE pd.plan_id = $2
      LIMIT 1
    `, [todayDate, plan_id]);

    if (hit.length) {
      console.log(`🛠️ plan_id ${plan_id} on ${machine_name_type} → Running`);
      await pool.query(`
        UPDATE planentry
        SET status = 'Running', updated_at = NOW()
        WHERE plan_id = $1 AND date = $2 AND status = 'Pending'
      `, [plan_id, todayDate]);
    }
  }
}

// 3) Completed update at shift end
async function finalizeAtShiftEnd() {
  const now = moment();
  const todayDate = now.format('YYYY-MM-DD');
  console.log(`\n🔄 [${now.format('YYYY-MM-DD HH:mm')}] Completed‑update check…`);

  const { rows: shifts } = await pool.query(`
    SELECT shift_no, shift_end_time
    FROM shift_master
  `);

  for (const { shift_no, shift_end_time } of shifts) {
    const shiftEndMoment = moment(`${todayDate} ${shift_end_time}`, 'YYYY-MM-DD HH:mm:ss');
    const diffInMinutes = now.diff(shiftEndMoment, 'minutes');

    // ✅ Run within 1-minute grace window
    if (diffInMinutes >= 0 && diffInMinutes <= 1) {
      console.log(`✅ Shift ${shift_no} ended—marking Completed`);
      await pool.query(`
        UPDATE planentry
        SET status = 'Completed', updated_at = NOW()
        WHERE shift_no = $1 AND date = $2 AND status <> 'Completed'
      `, [shift_no, todayDate]);
    }
  }
}

// 4) Manual insert from process_master trigger
async function insertPlanentryFromProcess(part_id, machine_id, cycle_time) {
  const today = moment().format('YYYY-MM-DD');
  const shift_no = 1;

  try {
    const { rows: partRows } = await pool.query(
      `SELECT part_name FROM part_master WHERE part_id = $1`,
      [part_id]
    );

    if (!partRows.length) {
      console.log(`❌ part_id ${part_id} not found in part_master.`);
      return;
    }

    const part_name = partRows[0].part_name;

    await pool.query(`
      INSERT INTO planentry (
        part_name, cycle_time, machine_id,
        selected_user, load_unload, status,
        shift_no, date, created_at, updated_at, part_id
      ) VALUES (
        $1, $2, $3,
        '', 0, 'Pending',
        $4, $5, NOW(), NOW(), $6
      )
      ON CONFLICT (machine_id, shift_no, date) DO NOTHING
    `, [part_name, cycle_time, machine_id, shift_no, today, part_id]);

    console.log(`✅ planentry inserted from process_master for machine_id ${machine_id}, part_id ${part_id}`);
  } catch (err) {
    console.error('❌ Error inserting into planentry from process:', err.message);
  }
}

// 5) Combined entry point
async function handlePlanEntryForShifts() {
  await handlePendingInserts();
  await updateRunningStatus();
  await finalizeAtShiftEnd();
}

// 6) Schedule every minute
cron.schedule('* * * * *', handlePlanEntryForShifts);

// 7) Export
module.exports = {
  handlePlanEntryForShifts,
  insertPlanentryFromProcess
};
