import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { csrfGuard } from './middleware/auth.js';
import { uploadsDir } from './middleware/upload.js';
import auth from './routes/auth.js';
import shop from './routes/shop.js';
import orders from './routes/orders.js';
import admin from './routes/admin.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(hpp());
app.use('/api', rateLimit({ windowMs: 60_000, limit: 200, standardHeaders: true }), csrfGuard);
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }));

app.use('/api/auth', auth);
app.use('/api/orders', orders);
app.use('/api/admin', admin);
app.use('/api', shop);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(422).json({ message: `${err.issues[0].path.join('.')}: ${err.issues[0].message}` });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Duplicate value (already exists)' });
  if (err.name === 'MulterError' || err.message?.startsWith('Only JPG')) return res.status(400).json({ message: err.message });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Server error' : err.message }); // never leak internals
});
export default app;
