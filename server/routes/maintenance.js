import { Router } from 'express';
import db from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  try {
    const { priority } = req.query;
    let sql = "SELECT * FROM maintenance_orders WHERE status != 'Completed'";
    const params = [];
    if (priority && priority !== 'All') { sql += ' AND priority = ?'; params.push(priority); }
    sql += ' ORDER BY due_date';
    res.json(db.prepare(sql).all(...params).map((m) => ({
      id: m.id, unit: m.unit_id, type: m.type, due: m.due_date,
      priority: m.priority, owner: m.owner, status: m.status,
    })));
  } catch (err) { next(err); }
});

router.patch('/:id/status',
  requireAuth,
  requireRole('Operations Lead', 'Maintenance Planner'),
  (req, res, next) => {
    try {
      const allowed = ['Pending', 'In Progress', 'Completed'];
      const { status } = req.body;
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
      }
      const info = db.prepare('UPDATE maintenance_orders SET status = ? WHERE id = ?')
        .run(status, req.params.id);
      if (!info.changes) return res.status(404).json({ error: 'Order not found' });
      res.json({ ok: true, id: Number(req.params.id), status });
    } catch (err) { next(err); }
  }
);

export default router;
