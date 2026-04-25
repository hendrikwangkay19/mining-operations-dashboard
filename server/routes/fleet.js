import { Router } from 'express';
import db from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  try {
    const { status, site } = req.query;
    let sql = 'SELECT * FROM fleet_units WHERE 1=1';
    const params = [];
    if (status && status !== 'All') { sql += ' AND status = ?'; params.push(status); }
    if (site   && site   !== 'All') { sql += ' AND site = ?';   params.push(site); }
    sql += ' ORDER BY id';
    res.json(db.prepare(sql).all(...params).map((u) => ({
      id: u.id, type: u.type, site: u.site, operator: u.operator,
      status: u.status, fuel: u.fuel, hours: u.hours,
      load: u.load, lastService: u.last_service, gps: u.gps,
    })));
  } catch (err) { next(err); }
});

router.get('/:id', requireAuth, (req, res, next) => {
  try {
    const unit = db.prepare('SELECT * FROM fleet_units WHERE id = ?').get(req.params.id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    res.json({ id: unit.id, type: unit.type, site: unit.site, operator: unit.operator,
      status: unit.status, fuel: unit.fuel, hours: unit.hours,
      load: unit.load, lastService: unit.last_service, gps: unit.gps });
  } catch (err) { next(err); }
});

router.patch('/:id/status',
  requireAuth,
  requireRole('Operations Lead'),
  (req, res, next) => {
    try {
      const allowed = ['Active', 'Standby', 'Warning', 'Maintenance'];
      const { status } = req.body;
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
      }
      const info = db.prepare(
        "UPDATE fleet_units SET status = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(status, req.params.id);
      if (!info.changes) return res.status(404).json({ error: 'Unit not found' });
      res.json({ ok: true, id: req.params.id, status });
    } catch (err) { next(err); }
  }
);

router.patch('/:id/fuel',
  requireAuth,
  requireRole('Operations Lead', 'Maintenance Planner'),
  (req, res, next) => {
    try {
      const fuel = Number(req.body.fuel);
      if (isNaN(fuel) || fuel < 0 || fuel > 100) {
        return res.status(400).json({ error: 'Fuel must be 0–100' });
      }
      const info = db.prepare(
        "UPDATE fleet_units SET fuel = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(fuel, req.params.id);
      if (!info.changes) return res.status(404).json({ error: 'Unit not found' });
      res.json({ ok: true, id: req.params.id, fuel });
    } catch (err) { next(err); }
  }
);

export default router;
