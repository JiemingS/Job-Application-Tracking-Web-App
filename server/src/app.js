import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { requireAuth } from './middleware/auth.js';
import { applicationsRouter } from './routes/applications.js';
import { dashboardRouter } from './routes/dashboard.js';
import { meRouter } from './routes/me.js';

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'jobtrack-api' });
});

app.use('/api/me', requireAuth, meRouter);
app.use('/api/applications', requireAuth, applicationsRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

export default app;
