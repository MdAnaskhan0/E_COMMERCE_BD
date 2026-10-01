import { Router } from 'express';
import { z } from 'zod';
import { q } from '../config/db.js';
import { ah, validate, HttpError } from '../utils/helpers.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
const LIST = `SELECT p.id,p.name_en,p.name_bn,p.price,p.sale_price,p.stock,p.unit,p.is_featured,p.sold_count,p.category_id,p.sub_category_id,
  (SELECT url FROM product_images WHERE product_id=p.id ORDER BY sort_order,id LIMIT 1) AS image,
  (SELECT ROUND(AVG(rating),1) FROM reviews WHERE product_id=p.id AND is_approved=1) AS rating,
  (SELECT COUNT(*) FROM reviews WHERE product_id=p.id AND is_approved=1) AS review_count
  FROM products p WHERE p.is_active=1`;

r.get('/shop-info', ah(async (_req, res) => { const [s] = await q('SELECT * FROM shop_info WHERE id=1'); res.json(s); }));

r.get('/categories', ah(async (_req, res) => {
  const cats = await q('SELECT id,name_en,name_bn FROM categories WHERE is_active=1 ORDER BY id');
  const subs = await q('SELECT id,category_id,name_en,name_bn FROM sub_categories WHERE is_active=1 ORDER BY id');
  res.json(cats.map((c) => ({ ...c, subs: subs.filter((s) => s.category_id === c.id) })));
}));

r.get('/products', ah(async (req, res) => {
  const { q: search, category, sub, featured, best, sort } = req.query;
  const page = Math.max(1, +req.query.page || 1), limit = Math.min(48, +req.query.limit || 12);
  let sql = LIST; const p = [];
  if (search) { sql += ' AND (p.name_en LIKE ? OR p.name_bn LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
  if (category) { sql += ' AND p.category_id=?'; p.push(+category); }
  if (sub) { sql += ' AND p.sub_category_id=?'; p.push(+sub); }
  if (featured) sql += ' AND p.is_featured=1';
  if (best) sql += ' AND p.sold_count>0';
  const order = { price_asc: 'COALESCE(p.sale_price,p.price) ASC', price_desc: 'COALESCE(p.sale_price,p.price) DESC' }[sort] || (best ? 'p.sold_count DESC' : 'p.id DESC');
  const total = (await q(`SELECT COUNT(*) c FROM (${sql}) t`, p))[0].c;
  const items = await q(`${sql} ORDER BY ${order} LIMIT ? OFFSET ?`, [...p, limit, (page - 1) * limit]); // order is whitelisted
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

r.get('/products/:id', ah(async (req, res) => {
  const [p] = await q('SELECT p.*, c.name_en cat_en, c.name_bn cat_bn FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=? AND p.is_active=1', [req.params.id]);
  if (!p) throw new HttpError(404, 'Product not found');
  const [images, features, tiers, reviews] = await Promise.all([
    q('SELECT id,url FROM product_images WHERE product_id=? ORDER BY sort_order,id', [p.id]),
    q('SELECT feature_key k, feature_value v FROM product_features WHERE product_id=? ORDER BY id', [p.id]),
    q('SELECT min_qty, unit_price FROM product_price_tiers WHERE product_id=? ORDER BY min_qty', [p.id]),
    q('SELECT r.id,r.rating,r.comment,r.created_at,u.name FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.product_id=? AND r.is_approved=1 ORDER BY r.id DESC', [p.id]),
  ]);
  res.json({ ...p, images, features, tiers, reviews });
}));

r.post('/products/:id/reviews', requireAuth, validate(z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(1000).default('') })),
  ah(async (req, res) => {
    await q('INSERT INTO reviews (product_id,user_id,rating,comment) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment)', [req.params.id, req.user.id, req.body.rating, req.body.comment]);
    res.status(201).json({ ok: true });
  }));

export async function applyCoupon(code, subtotal) {
  const [c] = await q('SELECT * FROM coupons WHERE code=? AND is_active=1', [String(code).trim().toUpperCase()]);
  if (!c) throw new HttpError(400, 'Invalid coupon');
  if (c.expires_at && new Date(c.expires_at) < new Date(new Date().toDateString())) throw new HttpError(400, 'Coupon expired');
  if (c.max_uses && c.used_count >= c.max_uses) throw new HttpError(400, 'Coupon limit reached');
  if (subtotal < c.min_order) throw new HttpError(400, `Minimum order ৳${c.min_order} required`);
  const discount = c.type === 'percent' ? Math.round(subtotal * c.value) / 100 : Math.min(c.value, subtotal);
  return { code: c.code, discount };
}
r.post('/coupons/validate', validate(z.object({ code: z.string().max(40), subtotal: z.number().nonnegative() })), ah(async (req, res) => res.json(await applyCoupon(req.body.code, req.body.subtotal))));
export default r;
