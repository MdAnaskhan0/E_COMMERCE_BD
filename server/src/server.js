import 'dotenv/config';
import app from './app.js';
import { pool } from './config/db.js';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) { console.error('Set a strong JWT_SECRET (32+ chars) in .env'); process.exit(1); }
await pool.query('SELECT 1');
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
