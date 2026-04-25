import { Router } from 'express';
import db from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, site } = req.query;
    let sql = 'SELECT * FROM fleet_units WHERE 1=1';
    const params = [];
    let idx = 1;
    if (status && status !== 'All') { sql += ` AND status = $${idx++}`; params.push(status); }
    if (site   && site   !== 'All') { sql += ` AND site = $${idx++}`;   params.push(site); }
    sql += ' ORDER BY id';
    const { rows } = await db.query(sql, params);
    res.json(rows.map((u) => ({
      id: u.id, type: u.type, site: u.site, operator: u.operator,
      status: u.status, fuel: u.fuel, hours: u.hours,
      load: u.load, lastService: u.last_service, gps: u.gps,
    })));
  } catch (err) { next(err); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM fleet_units WHERE id = $1', [req.params.id]);
    const unit = rows[0];
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    res.json({ id: unit.id, type: unit.type, site: unit.site, operator: unit.operator,
      status: unit.status, fuel: unit.fuel, hours: unit.hours,
      load: unit.load, lastService: unit.last_service, gps: unit.gps });
  } catch (err) { next(err); }
});

router.patch('/:id/status',
  requireAuth,
  requireRole('Operations Lead'),
  async (req, res, next) => {
    try {
      const allowed = ['Active', 'Standby', 'Warning', 'Maintenance'];
      const { status } = req.body;
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
      }
      const { rowCount } = await db.query(
        'UPDATE fleet_units SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, req.params.id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Unit not found' });
      res.json({ ok: true, id: req.params.id, status });
    } catch (err) { next(err); }
  }
);

router.patch('/:id/fuel',
  requireAuth,
  requireRole('Operations Lead', 'Maintenance Planner'),
  async (req, res, next) => {
    try {
      const fuel = Number(req.body.fuel);
      if (isNaN(fuel) || fuel < 0 || fuel > 100) {
        return res.status(400).json({ error: 'Fuel must be 0–100' });
      }
      const { rowCount } = await db.query(
        'UPDATE fleet_units SET fuel = $1, updated_at = NOW() WHERE id = $2',
        [fuel, req.params.id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Unit not found' });
      res.json({ ok: true, id: req.params.id, fuel });
    } catch (err) { next(err); }
  }
);

export default router;
