import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { q } from '../config/db.js';
import { ah, validate, HttpError } from '../utils/helpers.js';
import { setAuthCookie, requireAuth } from '../middleware/auth.js';

const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: true, message: { message: 'Too many attempts, try again later' } });
const phone = z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number');
const password = z.string().min(8).max(72).regex(/[A-Za-z]/, 'Password needs a letter').regex(/\d/, 'Password needs a number');
const DUMMY = bcrypt.hashSync('dummy-password-1', 12);

r.post('/register', limiter, validate(z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().toLowerCase(), phone, password })),
  ah(async (req, res) => {
    const { name, email, phone: ph, password: pw } = req.body;
    if ((await q('SELECT id FROM users WHERE email=?', [email])).length) throw new HttpError(409, 'Email already registered');
    const hash = await bcrypt.hash(pw, 12);
    const { insertId } = await q('INSERT INTO users (name,email,phone,password_hash) VALUES (?,?,?,?)', [name, email, ph, hash]);
    const user = { id: insertId, name, email, phone: ph, role: 'customer' };
    setAuthCookie(res, user); res.status(201).json({ user });
  }));

r.post('/login', limiter, validate(z.object({ email: z.string().email().toLowerCase(), password: z.string().max(72) })),
  ah(async (req, res) => {
    const [u] = await q('SELECT * FROM users WHERE email=?', [req.body.email]);
    const ok = await bcrypt.compare(req.body.password, u ? u.password_hash : DUMMY); // no user enumeration via timing
    if (!u || !ok || !u.is_active) throw new HttpError(401, 'Invalid email or password');
    setAuthCookie(res, u);
    res.json({ user: { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role } });
  }));

r.post('/logout', (_req, res) => { res.clearCookie('token'); res.json({ ok: true }); });
r.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

r.put('/me', requireAuth, validate(z.object({ name: z.string().trim().min(2).max(120), phone, current_password: z.string().optional(), new_password: password.optional() })),
  ah(async (req, res) => {
    const { name, phone: ph, current_password, new_password } = req.body;
    if (new_password) {
      const [u] = await q('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
      if (!current_password || !(await bcrypt.compare(current_password, u.password_hash))) throw new HttpError(400, 'Current password is wrong');
      await q('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(new_password, 12), req.user.id]);
    }
    await q('UPDATE users SET name=?, phone=? WHERE id=?', [name, ph, req.user.id]);
    res.json({ user: { ...req.user, name, phone: ph } });
  }));

const addr = z.object({ label: z.string().trim().max(50).default('Home'), full_name: z.string().trim().min(2).max(120), phone, address_line: z.string().trim().min(5).max(255), city: z.string().trim().min(2).max(80), is_default: z.boolean().default(false) });
r.get('/addresses', requireAuth, ah(async (req, res) => res.json(await q('SELECT * FROM addresses WHERE user_id=? ORDER BY is_default DESC, id DESC', [req.user.id]))));
r.post('/addresses', requireAuth, validate(addr), ah(async (req, res) => {
  const a = req.body; if (a.is_default) await q('UPDATE addresses SET is_default=0 WHERE user_id=?', [req.user.id]);
  const { insertId } = await q('INSERT INTO addresses (user_id,label,full_name,phone,address_line,city,is_default) VALUES (?,?,?,?,?,?,?)', [req.user.id, a.label, a.full_name, a.phone, a.address_line, a.city, a.is_default]);
  res.status(201).json({ id: insertId });
}));
r.put('/addresses/:id', requireAuth, validate(addr), ah(async (req, res) => {
  const a = req.body; if (a.is_default) await q('UPDATE addresses SET is_default=0 WHERE user_id=?', [req.user.id]);
  await q('UPDATE addresses SET label=?,full_name=?,phone=?,address_line=?,city=?,is_default=? WHERE id=? AND user_id=?', [a.label, a.full_name, a.phone, a.address_line, a.city, a.is_default, req.params.id, req.user.id]);
  res.json({ ok: true });
}));
r.delete('/addresses/:id', requireAuth, ah(async (req, res) => { await q('DELETE FROM addresses WHERE id=? AND user_id=?', [req.params.id, req.user.id]); res.json({ ok: true }); }));
export default r;
