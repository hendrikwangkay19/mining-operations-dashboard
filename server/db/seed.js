import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const already = db.prepare('SELECT COUNT(*) AS n FROM users').get();
if (already.n > 0) {
  console.log('Database already seeded — skipping.');
  process.exit(0);
}

const hash = (pw) => bcrypt.hashSync(pw, 10);

/* ── Users ── */
const addUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)');
addUser.run('ops.supervisor',       hash('mining123'), 'Operations Lead');
addUser.run('safety.officer',       hash('mining123'), 'Safety Officer');
addUser.run('maintenance.planner',  hash('mining123'), 'Maintenance Planner');

/* ── Fleet ── */
const addUnit = db.prepare(`
  INSERT INTO fleet_units (id,type,site,operator,status,fuel,hours,load,last_service,gps)
  VALUES (?,?,?,?,?,?,?,?,?,?)`);

const fleet = [
  ['EX-017','Excavator', 'Pit East',  'Raka',  'Active',      64,12842,'Coal seam 4',       '2026-04-09','-2.413, 115.302'],
  ['DT-203','Dump Truck','Pit North', 'Nadia', 'Warning',     42, 9140,'Overburden',         '2026-04-12','-2.408, 115.287'],
  ['DT-188','Dump Truck','ROM 2',     'Bima',  'Active',      73, 8723,'Coal',               '2026-04-15','-2.421, 115.319'],
  ['DZ-045','Dozer',     'Pit East',  'Siti',  'Standby',     58,11328,'Road trim',          '2026-04-01','-2.399, 115.276'],
  ['GR-022','Grader',    'Haul Road', 'Arman', 'Maintenance', 21,10552,'Scheduled service',  '2026-04-21','-2.435, 115.331'],
  ['DR-006','Drill',     'Pit North', 'Dewi',  'Active',      81, 7410,'Blast pattern N12',  '2026-04-10','-2.388, 115.265'],
];
fleet.forEach((row) => addUnit.run(...row));

/* ── Fleet utilization ── */
const addUtil = db.prepare('INSERT INTO fleet_utilization (equipment_type, utilization_pct) VALUES (?,?)');
[['Excavator',87],['Dump Truck',78],['Dozer',72],['Grader',64],['Drill',69]].forEach((r) => addUtil.run(...r));

/* ── Production records ── */
const addProd = db.prepare(`
  INSERT INTO production_records (site,material,target,actual,quality,recorded_date)
  VALUES (?,?,?,?,?,date('now'))`);
[
  ['Pit North', 'Overburden',    42000,43800,'N/A'],
  ['Pit East',  'Coal',          13500,12980,'5,720 kcal'],
  ['ROM 2',     'Coal crushed',  11800,12060,'5,680 kcal'],
  ['Waste Dump','Overburden',    39000,37150,'N/A'],
].forEach((r) => addProd.run(...r));

/* ── Production trend (7 days) ── */
const addTrend = db.prepare(`
  INSERT INTO production_trend (day,overburden,coal,recorded_date) VALUES (?,?,?,date('now'))`);
[
  ['Mon',41500,12600],['Tue',43800,13200],['Wed',46200,14100],
  ['Thu',44700,13900],['Fri',48750,15150],['Sat',47100,14680],['Sun',49200,15420],
].forEach(([d,o,c]) => addTrend.run(d,o,c));

/* ── Safety indicators ── */
const addSafety = db.prepare(`
  INSERT INTO safety_indicators (area,metric,value,status,recorded_date) VALUES (?,?,?,?,date('now'))`);
[
  ['Pit North','PPE Compliance',   '98%','Good'],
  ['Pit East', 'Near Miss',        '2',  'Watch'],
  ['Haul Road','Overspeed Events', '7',  'Action'],
  ['Workshop', 'Permit Closure',   '94%','Good'],
].forEach((r) => addSafety.run(...r));

/* ── Alerts ── */
const addAlert = db.prepare('INSERT INTO alerts (level,title,area,time) VALUES (?,?,?,?)');
[
  ['High',  'DT-203 tire temperature above threshold','Pit North','08:42'],
  ['Medium','EX-017 idle time exceeded plan',         'Pit East', '09:15'],
  ['Low',   'Rain expected near haul road 4',         'Hauling',  '10:05'],
].forEach((r) => addAlert.run(...r));

/* ── Maintenance orders ── */
const addMaint = db.prepare(`
  INSERT INTO maintenance_orders (unit_id,type,due_date,priority,owner) VALUES (?,?,?,?,?)`);
[
  ['GR-022','250h Service',      '2026-04-21','Urgent','Workshop A'],
  ['DT-203','Tire Inspection',   '2026-04-21','Urgent','Field Service'],
  ['EX-017','Hydraulic Sampling','2026-04-23','High',  'Reliability'],
  ['DR-006','Bit Replacement',   '2026-04-24','Medium','Drill Team'],
  ['DT-188','500h Service',      '2026-04-28','Medium','Workshop B'],
].forEach((r) => addMaint.run(...r));

/* ── Shift operations ── */
const addOp = db.prepare(`
  INSERT INTO shift_operations (shift,site,activity,target,actual,status,recorded_date)
  VALUES (?,?,?,?,?,?,date('now'))`);
[
  ['A','Pit North','Overburden removal','42,000 bcm','43,800 bcm','On Track'],
  ['A','ROM 2',    'Coal hauling',      '13,000 t',  '12,450 t',  'Watch'],
  ['B','Pit East', 'Road maintenance',  '6.5 km',    '5.8 km',    'Delayed'],
  ['B','Crusher',  'Feed rate',         '1,850 tph', '1,910 tph', 'On Track'],
].forEach((r) => addOp.run(...r));

/* ── Notifications ── */
const addNotif = db.prepare('INSERT INTO notifications (message) VALUES (?)');
['Shift B handover ready','Fuel reconciliation completed','Weather advisory updated']
  .forEach((m) => addNotif.run(m));

console.log('Database seeded successfully.');
console.log('  Users: ops.supervisor / safety.officer / maintenance.planner');
console.log('  Password for all: mining123');
