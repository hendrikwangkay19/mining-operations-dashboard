import { Router } from 'express';
import db from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM alerts WHERE is_active = 1 ORDER BY level DESC, id'
    );
    res.json(rows.map(({ id, level, title, area, time }) => ({ id, level, title, area, time })));
  } catch (err) { next(err); }
});

router.patch('/:id/resolve',
  requireAuth,
  requireRole('Operations Lead', 'Safety Officer'),
  async (req, res, next) => {
    try {
      const { rowCount } = await db.query(
        'UPDATE alerts SET is_active = 0 WHERE id = $1',
        [req.params.id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Alert not found' });
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

export default router;
