import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { q, pool } from '../config/db.js';
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;
const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await q(`INSERT INTO users (name,email,phone,password_hash,role) VALUES (?,?,?,?, 'admin') ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role='admin'`, [ADMIN_NAME, ADMIN_EMAIL.toLowerCase(), ADMIN_PHONE, hash]);
if (!(await q('SELECT id FROM categories LIMIT 1')).length) {
  await q("INSERT INTO categories (name_en,name_bn) VALUES ('Electronics','ইলেকট্রনিক্স'),('Fashion','ফ্যাশন'),('Home & Living','হোম ও লিভিং')");
  await q("INSERT INTO sub_categories (category_id,name_en,name_bn) VALUES (1,'Mobile','মোবাইল'),(1,'Headphones','হেডফোন'),(2,'Men','পুরুষ'),(2,'Women','মহিলা')");
  await q("INSERT INTO coupons (code,type,value,min_order) VALUES ('WELCOME10','percent',10,500)");
}
console.log('Seed complete. Admin:', ADMIN_EMAIL); await pool.end();
