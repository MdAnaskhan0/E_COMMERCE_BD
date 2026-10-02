import 'dotenv/config';
import app from './app.js';
import { pool } from './config/db.js';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) { console.error('Set a strong JWT_SECRET (32+ chars) in .env'); process.exit(1); }
await pool.query('SELECT 1');
for (const c of ['bkash_number', 'nagad_number']) { // auto-migration for existing databases
  const [r] = await pool.query("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shop_info' AND COLUMN_NAME=?", [c]);
  if (!r.length) await pool.query(`ALTER TABLE shop_info ADD COLUMN ${c} VARCHAR(20) NOT NULL DEFAULT ''`);
}
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
