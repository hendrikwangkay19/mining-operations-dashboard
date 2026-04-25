import { Router } from 'express';
import db from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  try {
    const fleet       = db.prepare('SELECT * FROM fleet_units ORDER BY id').all();
    const production  = db.prepare("SELECT * FROM production_records WHERE recorded_date = date('now') ORDER BY id").all();
    const trend       = db.prepare('SELECT * FROM production_trend ORDER BY id').all();
    const utilization = db.prepare('SELECT equipment_type AS name, utilization_pct AS value FROM fleet_utilization ORDER BY id').all();
    const safety      = db.prepare("SELECT * FROM safety_indicators WHERE recorded_date = date('now') ORDER BY id").all();
    const alerts      = db.prepare("SELECT * FROM alerts WHERE is_active = 1 ORDER BY level DESC, id").all();
    const maintenance = db.prepare("SELECT * FROM maintenance_orders WHERE status != 'Completed' ORDER BY due_date").all();
    const operations  = db.prepare("SELECT * FROM shift_operations WHERE recorded_date = date('now') ORDER BY id").all();
    const notifs      = db.prepare('SELECT message FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT 10').all();

    /* KPI summary */
    const totalActual    = production.reduce((s, r) => s + r.actual, 0);
    const activeUnits    = fleet.filter((u) => u.status === 'Active').length;
    const availability   = fleet.length ? ((activeUnits / fleet.length) * 100).toFixed(1) : 0;
    const highAlerts     = alerts.filter((a) => a.level === 'High').length;
    const urgentMaint    = maintenance.filter((m) => m.priority === 'Urgent' || m.priority === 'High').length;

    const summary = [
      { label: 'Daily Production',  value: `${totalActual.toLocaleString()} t`, delta: '+8.4%',      tone: 'positive' },
      { label: 'Fleet Availability',value: `${availability}%`,                  delta: `${activeUnits}/${fleet.length} active`, tone: 'positive' },
      { label: 'Hauling Cycles',    value: '1,284',                             delta: '-3.2%',      tone: 'warning'  },
      { label: 'Fuel Burn',         value: '38.4 kL',                           delta: '-5.6%',      tone: 'positive' },
      { label: 'Safety Incidents',  value: String(highAlerts),                  delta: '0 severe',   tone: highAlerts > 0 ? 'danger' : 'positive' },
      { label: 'Maintenance Due',   value: String(maintenance.length),          delta: `${urgentMaint} urgent`, tone: urgentMaint > 0 ? 'warning' : 'positive' },
    ];

    res.json({
      summary,
      productionTrend: trend.map(({ day, overburden, coal }) => ({ day, overburden, coal })),
      utilization,
      fleet: fleet.map((u) => ({
        id: u.id, type: u.type, site: u.site, operator: u.operator,
        status: u.status, fuel: u.fuel, hours: u.hours, load: u.load,
        lastService: u.last_service, gps: u.gps,
      })),
      production: production.map((p) => ({
        site: p.site, material: p.material, target: p.target, actual: p.actual,
        quality: p.quality, recovery: Math.round((p.actual / p.target) * 100),
      })),
      safety: safety.map(({ area, metric, value, status }) => ({ area, metric, value, status })),
      alerts: alerts.map(({ level, title, area, time }) => ({ level, title, area, time })),
      maintenance: maintenance.map((m) => ({
        unit: m.unit_id, type: m.type, due: m.due_date,
        priority: m.priority, owner: m.owner, status: m.status,
      })),
      operations: operations.map(({ shift, site, activity, target, actual, status }) =>
        ({ shift, site, activity, target, actual, status })),
      notifications: notifs.map((n) => n.message),
    });
  } catch (err) { next(err); }
});

export default router;
