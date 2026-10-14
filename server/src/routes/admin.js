import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { pool, q } from '../config/db.js';
import { ah, validate, HttpError } from '../utils/helpers.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload, uploadsDir } from '../middleware/upload.js';
import { cleanHtml } from '../utils/sanitize.js';
import { PAGE_SLUGS } from '../utils/defaultPages.js';

const r = Router();
r.use(requireAdmin);
const bool = z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0));

// ---------- dashboard ----------
r.get('/stats', ah(async (_req, res) => {
  const [[a]] = await pool.query(`SELECT (SELECT COUNT(*) FROM orders) orders,(SELECT COALESCE(SUM(total),0) FROM orders WHERE status<>'cancelled') revenue,
    (SELECT COUNT(*) FROM users WHERE role='customer') customers,(SELECT COUNT(*) FROM products) products,(SELECT COUNT(*) FROM orders WHERE status='pending') pending`);
  res.json({ ...a, sales: await q(`SELECT DATE_FORMAT(created_at,'%d %b') d, SUM(total) t FROM orders WHERE created_at >= CURDATE() - INTERVAL 6 DAY AND status<>'cancelled' GROUP BY DATE(created_at), d ORDER BY DATE(created_at)`), recent: await q('SELECT order_no,customer_name,total,status,created_at FROM orders ORDER BY id DESC LIMIT 6'),
    lowStock: await q('SELECT id,name_en,stock FROM products WHERE stock<=5 ORDER BY stock LIMIT 6') });
}));

// ---------- generic CRUD for simple tables ----------
const crud = (path_, table, schema, cols) => {
  r.get(path_, ah(async (_req, res) => res.json(await q(`SELECT * FROM ${table} ORDER BY id DESC`))));
  r.post(path_, validate(schema), ah(async (req, res) => {
    const k = cols.filter((c) => req.body[c] !== undefined);
    const { insertId } = await q(`INSERT INTO ${table} (${k.join(',')}) VALUES (${k.map(() => '?').join(',')})`, k.map((c) => req.body[c])); res.status(201).json({ id: insertId });
  }));
  r.put(`${path_}/:id`, validate(schema), ah(async (req, res) => {
    const k = cols.filter((c) => req.body[c] !== undefined);
    await q(`UPDATE ${table} SET ${k.map((c) => `${c}=?`).join(',')} WHERE id=?`, [...k.map((c) => req.body[c]), req.params.id]); res.json({ ok: true });
  }));
  r.delete(`${path_}/:id`, ah(async (req, res) => { await q(`DELETE FROM ${table} WHERE id=?`, [req.params.id]); res.json({ ok: true }); }));
};
const name = { name_en: z.string().trim().min(1).max(120), name_bn: z.string().trim().max(120).default(''), is_active: bool.default(1) };
crud('/categories', 'categories', z.object(name), ['name_en', 'name_bn', 'is_active']);
crud('/sub-categories', 'sub_categories', z.object({ ...name, category_id: z.coerce.number().int().positive() }), ['category_id', 'name_en', 'name_bn', 'is_active']);
crud('/coupons', 'coupons', z.object({ code: z.string().trim().toUpperCase().min(3).max(40), type: z.enum(['percent', 'fixed']), value: z.coerce.number().positive(),
  min_order: z.coerce.number().min(0).default(0), max_uses: z.coerce.number().int().positive().nullable().optional().or(z.literal('').transform(() => null)),
  expires_at: z.string().nullable().optional().or(z.literal('').transform(() => null)), is_active: bool.default(1) }), ['code', 'type', 'value', 'min_order', 'max_uses', 'expires_at', 'is_active']);

// ---------- users ----------
r.get('/users', ah(async (_req, res) => res.json(await q('SELECT id,name,email,phone,role,is_active,created_at FROM users ORDER BY id DESC'))));
r.put('/users/:id', validate(z.object({ role: z.enum(['customer', 'admin']), is_active: bool })), ah(async (req, res) => {
  if (+req.params.id === req.user.id) throw new HttpError(400, "You can't change your own role/status");
  await q('UPDATE users SET role=?, is_active=? WHERE id=?', [req.body.role, req.body.is_active, req.params.id]); res.json({ ok: true });
}));

// ---------- products (multipart: field "data" = JSON, files "images") ----------
const productSchema = z.object({
  name_en: z.string().trim().min(2).max(255), name_bn: z.string().trim().max(255).default(''), sku: z.string().trim().max(60).nullable().optional().transform((v) => v || null),
  brand: z.string().trim().max(120).default(''), category_id: z.number().int().positive(), sub_category_id: z.number().int().positive().nullable().optional(),
  price: z.number().positive(), sale_price: z.number().positive().nullable().optional(), stock: z.number().int().min(0), unit: z.string().max(30).default('pcs'), weight: z.string().max(40).default(''),
  description_en: z.string().max(30000).default('').transform(cleanHtml), description_bn: z.string().max(30000).default('').transform(cleanHtml), is_featured: bool.default(0), is_active: bool.default(1),
  features: z.array(z.object({ k: z.string().trim().min(1).max(120), v: z.string().trim().min(1).max(255) })).max(40).default([]),
  tiers: z.array(z.object({ min_qty: z.number().int().min(2), unit_price: z.number().positive() })).max(10).default([]),
  remove_image_ids: z.array(z.number().int()).default([]),
});
r.get('/products', ah(async (_req, res) => res.json(await q(`SELECT p.*,(SELECT url FROM product_images WHERE product_id=p.id ORDER BY sort_order,id LIMIT 1) image FROM products p ORDER BY id DESC`))));
r.get('/products/:id', ah(async (req, res) => {
  const [p] = await q('SELECT * FROM products WHERE id=?', [req.params.id]); if (!p) throw new HttpError(404, 'Not found');
  res.json({ ...p, images: await q('SELECT id,url FROM product_images WHERE product_id=?', [p.id]),
    features: (await q('SELECT feature_key k, feature_value v FROM product_features WHERE product_id=?', [p.id])),
    tiers: await q('SELECT min_qty, unit_price FROM product_price_tiers WHERE product_id=? ORDER BY min_qty', [p.id]) });
}));
const saveProduct = (isNew) => ah(async (req, res) => {
  const d = productSchema.parse(JSON.parse(req.body.data || '{}'));
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction(); let id = req.params.id;
    const f = [d.name_en, d.name_bn, d.sku, d.brand, d.category_id, d.sub_category_id ?? null, d.price, d.sale_price ?? null, d.stock, d.unit, d.weight, d.description_en, d.description_bn, d.is_featured, d.is_active];
    if (isNew) { const [x] = await conn.query('INSERT INTO products (name_en,name_bn,sku,brand,category_id,sub_category_id,price,sale_price,stock,unit,weight,description_en,description_bn,is_featured,is_active) VALUES (?)', [f]); id = x.insertId; }
    else await conn.query('UPDATE products SET name_en=?,name_bn=?,sku=?,brand=?,category_id=?,sub_category_id=?,price=?,sale_price=?,stock=?,unit=?,weight=?,description_en=?,description_bn=?,is_featured=?,is_active=? WHERE id=?', [...f, id]);
    await conn.query('DELETE FROM product_features WHERE product_id=?', [id]); await conn.query('DELETE FROM product_price_tiers WHERE product_id=?', [id]);
    for (const x of d.features) await conn.query('INSERT INTO product_features (product_id,feature_key,feature_value) VALUES (?,?,?)', [id, x.k, x.v]);
    for (const t of d.tiers) await conn.query('INSERT INTO product_price_tiers (product_id,min_qty,unit_price) VALUES (?,?,?)', [id, t.min_qty, t.unit_price]);
    if (d.remove_image_ids.length) {
      const [old] = await conn.query('SELECT url FROM product_images WHERE product_id=? AND id IN (?)', [id, d.remove_image_ids]);
      await conn.query('DELETE FROM product_images WHERE product_id=? AND id IN (?)', [id, d.remove_image_ids]);
      for (const o of old) fs.unlink(path.join(uploadsDir, path.basename(o.url))).catch(() => {});
    }
    for (const file of req.files || []) await conn.query('INSERT INTO product_images (product_id,url) VALUES (?,?)', [id, `/uploads/${file.filename}`]);
    await conn.commit(); res.status(isNew ? 201 : 200).json({ id });
  } catch (e) { await conn.rollback(); for (const f of req.files || []) fs.unlink(f.path).catch(() => {}); throw e; } finally { conn.release(); }
});
r.post('/products', upload.array('images', 8), saveProduct(true));
r.put('/products/:id', upload.array('images', 8), saveProduct(false));
r.delete('/products/:id', ah(async (req, res) => { await q('DELETE FROM products WHERE id=?', [req.params.id]); res.json({ ok: true }); }));

// ---------- offers ----------
const dateOrNull = z.string().nullable().optional().transform((v) => v || null).refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Invalid date');
const offerSchema = z.object({ title_en: z.string().trim().max(200).default(''), title_bn: z.string().trim().max(200).default(''), summary_en: z.string().trim().max(400).default(''), summary_bn: z.string().trim().max(400).default(''),
  description_en: z.string().max(30000).default('').transform(cleanHtml), description_bn: z.string().max(30000).default('').transform(cleanHtml), badge: z.string().trim().max(40).default(''),
  coupon_code: z.string().trim().toUpperCase().max(40).default(''), link: z.string().max(255).default('').refine((v) => v === '' || /^(\/|https?:\/\/)/.test(v), 'Link must start with / or https://'),
  starts_at: dateOrNull, ends_at: dateOrNull, sort_order: z.coerce.number().int().min(0).max(999).default(0), is_active: bool.default(1) })
  .refine((o) => o.title_en || o.title_bn, { message: 'Enter a title (English or Bangla)', path: ['title_en'] })
  .refine((o) => !o.starts_at || !o.ends_at || o.starts_at <= o.ends_at, { message: 'End date must be after start date', path: ['ends_at'] });
const OF = ['title_en', 'title_bn', 'summary_en', 'summary_bn', 'description_en', 'description_bn', 'badge', 'coupon_code', 'link', 'starts_at', 'ends_at', 'sort_order', 'is_active'];
r.get('/offers', ah(async (_req, res) => res.json(await q('SELECT * FROM offers ORDER BY sort_order, id DESC'))));
r.post('/offers', upload.single('image'), ah(async (req, res) => {
  try {
    if (!req.file) throw new HttpError(400, 'Offer image is required');
    const o = offerSchema.parse(JSON.parse(req.body.data || '{}'));
    const { insertId } = await q(`INSERT INTO offers (image,${OF.join(',')}) VALUES (?,${OF.map(() => '?').join(',')})`, [`/uploads/${req.file.filename}`, ...OF.map((k) => o[k])]);
    res.status(201).json({ id: insertId });
  } catch (e) { if (req.file) fs.unlink(req.file.path).catch(() => {}); throw e; }
}));
r.put('/offers/:id', upload.single('image'), ah(async (req, res) => {
  try {
    const o = offerSchema.parse(JSON.parse(req.body.data || '{}'));
    const [old] = await q('SELECT image FROM offers WHERE id=?', [req.params.id]); if (!old) throw new HttpError(404, 'Not found');
    await q(`UPDATE offers SET image=?,${OF.map((k) => `${k}=?`).join(',')} WHERE id=?`, [req.file ? `/uploads/${req.file.filename}` : old.image, ...OF.map((k) => o[k]), req.params.id]);
    if (req.file) fs.unlink(path.join(uploadsDir, path.basename(old.image))).catch(() => {});
    res.json({ ok: true });
  } catch (e) { if (req.file) fs.unlink(req.file.path).catch(() => {}); throw e; }
}));
r.delete('/offers/:id', ah(async (req, res) => {
  const [old] = await q('SELECT image FROM offers WHERE id=?', [req.params.id]);
  await q('DELETE FROM offers WHERE id=?', [req.params.id]); if (old) fs.unlink(path.join(uploadsDir, path.basename(old.image))).catch(() => {}); res.json({ ok: true });
}));

// ---------- info pages (About, Terms, Privacy, Refund) ----------
r.get('/pages', ah(async (_req, res) => res.json(await q('SELECT * FROM site_pages ORDER BY FIELD(slug,?)', [PAGE_SLUGS]))));
r.put('/pages/:slug', validate(z.object({ title_en: z.string().trim().min(1).max(150), title_bn: z.string().trim().max(150).default(''),
  content_en: z.string().max(60000).default('').transform(cleanHtml), content_bn: z.string().max(60000).default('').transform(cleanHtml) })), ah(async (req, res) => {
  if (!PAGE_SLUGS.includes(req.params.slug)) throw new HttpError(404, 'Unknown page');
  const b = req.body; await q('UPDATE site_pages SET title_en=?,title_bn=?,content_en=?,content_bn=? WHERE slug=?', [b.title_en, b.title_bn, b.content_en, b.content_bn, req.params.slug]);
  res.json({ ok: true });
}));

// ---------- banners (home slider, max 5) ----------
const bannerSchema = z.object({ title_en: z.string().max(150).default(''), title_bn: z.string().max(150).default(''), subtitle_en: z.string().max(300).default(''), subtitle_bn: z.string().max(300).default(''),
  button_text: z.string().max(40).default(''), link: z.string().max(255).default('').refine((v) => v === '' || /^(\/|https?:\/\/)/.test(v), 'Link must start with / or https://'),
  sort_order: z.coerce.number().int().min(0).max(99).default(0), is_active: bool.default(1) });
r.get('/banners', ah(async (_req, res) => res.json(await q('SELECT * FROM banners ORDER BY sort_order, id'))));
r.post('/banners', upload.single('image'), ah(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Slide image is required');
  try {
    if ((await q('SELECT COUNT(*) c FROM banners'))[0].c >= 5) throw new HttpError(400, 'Maximum 5 slides allowed');
    const b = bannerSchema.parse(JSON.parse(req.body.data || '{}'));
    const { insertId } = await q('INSERT INTO banners (image,title_en,title_bn,subtitle_en,subtitle_bn,button_text,link,sort_order,is_active) VALUES (?,?,?,?,?,?,?,?,?)',
      [`/uploads/${req.file.filename}`, b.title_en, b.title_bn, b.subtitle_en, b.subtitle_bn, b.button_text, b.link, b.sort_order, b.is_active]);
    res.status(201).json({ id: insertId });
  } catch (e) { fs.unlink(req.file.path).catch(() => {}); throw e; }
}));
r.put('/banners/:id', upload.single('image'), ah(async (req, res) => {
  try {
    const b = bannerSchema.parse(JSON.parse(req.body.data || '{}'));
    const [old] = await q('SELECT image FROM banners WHERE id=?', [req.params.id]); if (!old) throw new HttpError(404, 'Not found');
    const image = req.file ? `/uploads/${req.file.filename}` : old.image;
    await q('UPDATE banners SET image=?,title_en=?,title_bn=?,subtitle_en=?,subtitle_bn=?,button_text=?,link=?,sort_order=?,is_active=? WHERE id=?', [image, b.title_en, b.title_bn, b.subtitle_en, b.subtitle_bn, b.button_text, b.link, b.sort_order, b.is_active, req.params.id]);
    if (req.file) fs.unlink(path.join(uploadsDir, path.basename(old.image))).catch(() => {});
    res.json({ ok: true });
  } catch (e) { if (req.file) fs.unlink(req.file.path).catch(() => {}); throw e; }
}));
r.delete('/banners/:id', ah(async (req, res) => {
  const [old] = await q('SELECT image FROM banners WHERE id=?', [req.params.id]);
  await q('DELETE FROM banners WHERE id=?', [req.params.id]); if (old) fs.unlink(path.join(uploadsDir, path.basename(old.image))).catch(() => {}); res.json({ ok: true });
}));

// ---------- orders ----------
const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
r.get('/orders', ah(async (req, res) => {
  const rows = await q(`SELECT id,order_no,customer_name,customer_phone,total,status,payment_method,payment_status,created_at,(SELECT COUNT(*) FROM order_items WHERE order_id=orders.id) items FROM orders ${req.query.status ? 'WHERE status=?' : ''} ORDER BY id DESC LIMIT 500`, req.query.status ? [req.query.status] : []);
  res.json(rows);
}));
r.get('/orders/:id', ah(async (req, res) => {
  const [o] = await q('SELECT * FROM orders WHERE id=?', [req.params.id]); if (!o) throw new HttpError(404, 'Order not found');
  res.json({ ...o, items: await q('SELECT product_name,unit_price,quantity,line_total FROM order_items WHERE order_id=?', [o.id]), history: await q('SELECT status,created_at FROM order_status_history WHERE order_id=? ORDER BY id', [o.id]) });
}));
r.put('/orders/:id', validate(z.object({ status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']), payment_status: z.enum(['unpaid', 'paid', 'refunded']) })),
  ah(async (req, res) => {
    const [o] = await q('SELECT status FROM orders WHERE id=?', [req.params.id]); if (!o) throw new HttpError(404, 'Not found');
    const cur = o.status, next = req.body.status;
    if (next !== cur) { // status can only move FORWARD
      if (cur === 'delivered' || cur === 'cancelled') throw new HttpError(400, `Order is already ${cur} and cannot be changed`);
      if (next === 'cancelled') { if (cur === 'shipped') throw new HttpError(400, 'A shipped order cannot be cancelled'); }
      else if (FLOW.indexOf(next) < FLOW.indexOf(cur)) throw new HttpError(400, 'Order status cannot go backward');
    }
    await q('UPDATE orders SET status=?, payment_status=? WHERE id=?', [next, req.body.payment_status, req.params.id]);
    if (next !== cur) {
      await q('INSERT INTO order_status_history (order_id,status) VALUES (?,?)', [req.params.id, next]);
      if (next === 'cancelled') await q('UPDATE products p JOIN order_items i ON i.product_id=p.id SET p.stock=p.stock+i.quantity, p.sold_count=GREATEST(0,p.sold_count-i.quantity) WHERE i.order_id=?', [req.params.id]);
    }
    res.json({ ok: true });
  }));

// ---------- reviews ----------
r.get('/reviews', ah(async (_req, res) => res.json(await q('SELECT r.*,u.name user_name,p.name_en product FROM reviews r JOIN users u ON u.id=r.user_id JOIN products p ON p.id=r.product_id ORDER BY r.id DESC'))));
r.put('/reviews/:id', validate(z.object({ is_approved: bool })), ah(async (req, res) => { await q('UPDATE reviews SET is_approved=? WHERE id=?', [req.body.is_approved, req.params.id]); res.json({ ok: true }); }));
r.delete('/reviews/:id', ah(async (req, res) => { await q('DELETE FROM reviews WHERE id=?', [req.params.id]); res.json({ ok: true }); }));

// ---------- shop info (logo upload) ----------
r.put('/shop-info', upload.single('logo'), ah(async (req, res) => {
  const d = z.object({ shop_name: z.string().trim().min(1).max(120), address: z.string().max(255), phone: z.string().max(30), email: z.string().max(190),
    facebook: z.string().max(255), instagram: z.string().max(255), youtube: z.string().max(255), whatsapp: z.string().max(255), bkash_number: z.string().max(20).default(''), nagad_number: z.string().max(20).default(''), notice: z.string().max(500), shipping_fee: z.coerce.number().min(0) }).parse(JSON.parse(req.body.data));
  const k = Object.keys(d); const v = Object.values(d);
  if (req.file) { k.push('logo'); v.push(`/uploads/${req.file.filename}`); }
  await q(`UPDATE shop_info SET ${k.map((c) => `${c}=?`).join(',')} WHERE id=1`, v); res.json({ ok: true });
}));
export default r;
