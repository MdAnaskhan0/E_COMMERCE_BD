import 'dotenv/config';
import app from './app.js';
import { pool } from './config/db.js';
import { DEFAULT_PAGES } from './utils/defaultPages.js';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) { console.error('Set a strong JWT_SECRET (32+ chars) in .env'); process.exit(1); }
await pool.query('SELECT 1');
await pool.query(`CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255) NOT NULL,
  title_en VARCHAR(150) NOT NULL DEFAULT '',
  title_bn VARCHAR(150) NOT NULL DEFAULT '',
  subtitle_en VARCHAR(300) NOT NULL DEFAULT '',
  subtitle_bn VARCHAR(300) NOT NULL DEFAULT '',
  button_text VARCHAR(40) NOT NULL DEFAULT '',
  link VARCHAR(255) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1
)`); // auto-create slider table for existing databases
await pool.query(`CREATE TABLE IF NOT EXISTS offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(200) NOT NULL DEFAULT '',
  title_bn VARCHAR(200) NOT NULL DEFAULT '',
  summary_en VARCHAR(400) NOT NULL DEFAULT '',
  summary_bn VARCHAR(400) NOT NULL DEFAULT '',
  description_en TEXT,
  description_bn TEXT,
  image VARCHAR(255) NOT NULL,
  badge VARCHAR(40) NOT NULL DEFAULT '',
  coupon_code VARCHAR(40) NOT NULL DEFAULT '',
  link VARCHAR(255) NOT NULL DEFAULT '',
  starts_at DATE NULL,
  ends_at DATE NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);
await pool.query(`CREATE TABLE IF NOT EXISTS site_pages (
  slug VARCHAR(30) PRIMARY KEY,
  title_en VARCHAR(150) NOT NULL DEFAULT '',
  title_bn VARCHAR(150) NOT NULL DEFAULT '',
  content_en MEDIUMTEXT,
  content_bn MEDIUMTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`);
for (const [slug, d] of Object.entries(DEFAULT_PAGES)) // first-run starter content (never overwrites your edits)
  await pool.query('INSERT IGNORE INTO site_pages (slug,title_en,title_bn,content_en,content_bn) VALUES (?,?,?,?,?)', [slug, d.title_en, d.title_bn, d.content_en, d.content_bn]);
for (const c of ['bkash_number', 'nagad_number']) { // auto-migration for existing databases
  const [r] = await pool.query("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shop_info' AND COLUMN_NAME=?", [c]);
  if (!r.length) await pool.query(`ALTER TABLE shop_info ADD COLUMN ${c} VARCHAR(20) NOT NULL DEFAULT ''`);
}
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
