import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { pool, q } from '../config/db.js';
import { ah, validate, HttpError, orderNo } from '../utils/helpers.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { applyCoupon } from './shop.js';
import { sendOrderEmail } from '../utils/mailer.js';

const r = Router();
const phone = z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number');
const schema = z.object({
  items: z.array(z.object({ product_id: z.number().int().positive(), qty: z.number().int().min(1).max(999) })).min(1).max(50),
  name: z.string().trim().min(2).max(120), phone, email: z.string().email().optional().or(z.literal('')),
  address_line: z.string().trim().min(5).max(255), city: z.string().trim().min(2).max(80), note: z.string().trim().max(500).optional(),
  payment_method: z.enum(['cod', 'bkash', 'nagad']), payment_trx_id: z.string().trim().regex(/^[A-Za-z0-9]{6,20}$/, 'Invalid Transaction ID').optional(), coupon: z.string().max(40).optional(),
});
// Price is ALWAYS recomputed on the server (never trust the browser)
const unitPrice = (p, tiers, qty) => {
  const t = tiers.filter((x) => x.product_id === p.id && qty >= x.min_qty).sort((a, b) => b.min_qty - a.min_qty)[0];
  return t ? t.unit_price : p.sale_price ?? p.price;
};

r.post('/', optionalAuth, validate(schema), ah(async (req, res) => {
  const b = req.body; if (b.payment_method !== 'cod' && !b.payment_trx_id) throw new HttpError(400, 'Transaction ID required');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const ids = [...new Set(b.items.map((i) => i.product_id))];
    const [prods] = await conn.query('SELECT * FROM products WHERE id IN (?) AND is_active=1 FOR UPDATE', [ids]);
    const [tiers] = await conn.query('SELECT * FROM product_price_tiers WHERE product_id IN (?)', [ids]);
    let subtotal = 0; const lines = [];
    for (const it of b.items) {
      const p = prods.find((x) => x.id === it.product_id); if (!p) throw new HttpError(400, 'A product is unavailable');
      if (p.stock < it.qty) throw new HttpError(400, `Only ${p.stock} left: ${p.name_en}`);
      const up = unitPrice(p, tiers, it.qty), lt = Math.round(up * it.qty * 100) / 100; subtotal += lt;
      lines.push({ product_id: p.id, product_name: p.name_en + (p.name_bn ? ` / ${p.name_bn}` : ''), unit_price: up, quantity: it.qty, line_total: lt });
    }
    let discount = 0, code = null;
    if (b.coupon) { const c = await applyCoupon(b.coupon, subtotal); discount = c.discount; code = c.code; }
    const [[shop]] = await conn.query('SELECT shipping_fee FROM shop_info WHERE id=1');
    const total = Math.max(0, subtotal - discount) + shop.shipping_fee, no = orderNo();
    const [o] = await conn.query('INSERT INTO orders (order_no,user_id,customer_name,customer_phone,customer_email,address_line,city,note,subtotal,discount,shipping_fee,total,coupon_code,payment_method,payment_trx_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [no, req.user?.id ?? null, b.name, b.phone, b.email || null, b.address_line, b.city, b.note || null, subtotal, discount, shop.shipping_fee, total, code, b.payment_method, b.payment_trx_id || null]);
    for (const l of lines) {
      await conn.query('INSERT INTO order_items (order_id,product_id,product_name,unit_price,quantity,line_total) VALUES (?,?,?,?,?,?)', [o.insertId, l.product_id, l.product_name, l.unit_price, l.quantity, l.line_total]);
      await conn.query('UPDATE products SET stock=stock-?, sold_count=sold_count+? WHERE id=?', [l.quantity, l.quantity, l.product_id]);
    }
    if (code) await conn.query('UPDATE coupons SET used_count=used_count+1 WHERE code=?', [code]);
    await conn.query('INSERT INTO order_status_history (order_id,status) VALUES (?,?)', [o.insertId, 'pending']);
    await conn.commit();
    res.status(201).json({ order_no: no, total });
    sendOrderEmail({ order_no: no, customer_name: b.name, customer_phone: b.phone, address_line: b.address_line, city: b.city, total, payment_method: b.payment_method }, lines).catch((e) => console.error('[mail]', e.message));
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

const detail = async (o) => ({ ...o,
  items: await q('SELECT product_name,unit_price,quantity,line_total FROM order_items WHERE order_id=?', [o.id]),
  history: await q('SELECT status,created_at FROM order_status_history WHERE order_id=? ORDER BY id', [o.id]) });

r.get('/my', requireAuth, ah(async (req, res) => {
  const rows = await q('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC', [req.user.id]);
  res.json(await Promise.all(rows.map(detail)));
}));
// Track by order number only. Returns NO personal data (no phone/address/email).
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { message: 'Too many attempts, try again later' } });
r.post('/track', trackLimiter, validate(z.object({ order_no: z.string().trim().min(6).max(30) })), ah(async (req, res) => {
  const [o] = await q('SELECT id,order_no,status,payment_method,payment_status,subtotal,discount,shipping_fee,total,created_at FROM orders WHERE order_no=?', [req.body.order_no.toUpperCase()]);
  if (!o) throw new HttpError(404, 'Order not found');
  res.json(await detail(o));
}));
export default r;
