import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import authRoutes        from './routes/auth.js';
import dashboardRoutes   from './routes/dashboard.js';
import fleetRoutes       from './routes/fleet.js';
import maintenanceRoutes from './routes/maintenance.js';
import alertsRoutes      from './routes/alerts.js';
import { errorHandler }  from './middleware/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

/* ── Middleware ── */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ── API routes ── */
app.use('/api/auth',        authRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/fleet',       fleetRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/alerts',      alertsRoutes);

/* ── Static frontend ── */
const publicDir = join(__dirname, '../public');
app.use(express.static(publicDir));

/* ── SPA fallback ── */
app.get('*', (req, res) => {
  res.sendFile(join(publicDir, 'index.html'));
});

/* ── Error handler ── */
app.use(errorHandler);

export default app;
