import { Router } from 'express';
import db from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) => {
  try {
    const alerts = db.prepare('SELECT * FROM alerts WHERE is_active = 1 ORDER BY level DESC, id').all();
    res.json(alerts.map(({ id, level, title, area, time }) => ({ id, level, title, area, time })));
  } catch (err) { next(err); }
});

router.patch('/:id/resolve',
  requireAuth,
  requireRole('Operations Lead', 'Safety Officer'),
  (req, res, next) => {
    try {
      const info = db.prepare('UPDATE alerts SET is_active = 0 WHERE id = ?').run(req.params.id);
      if (!info.changes) return res.status(404).json({ error: 'Alert not found' });
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

export default router;
