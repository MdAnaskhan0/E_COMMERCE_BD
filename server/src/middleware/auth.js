import jwt from 'jsonwebtoken';
import { q } from '../config/db.js';
import { HttpError, ah } from '../utils/helpers.js';

export const setAuthCookie = (res, user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5, path: '/' });
};
const load = async (req) => {
  const t = req.cookies?.token; if (!t) return null;
  try {
    const { id } = jwt.verify(t, process.env.JWT_SECRET);
    const [u] = await q('SELECT id,name,email,phone,role,is_active FROM users WHERE id=?', [id]);
    return u && u.is_active ? u : null;
  } catch { return null; }
};
export const optionalAuth = ah(async (req, _res, next) => { req.user = await load(req); next(); });
export const requireAuth = ah(async (req, _res, next) => { req.user = await load(req); if (!req.user) throw new HttpError(401, 'Please sign in'); next(); });
export const requireAdmin = [requireAuth, (req, _res, next) => (req.user.role === 'admin' ? next() : next(new HttpError(403, 'Admins only')))];
// CSRF defence: state-changing calls must carry a custom header (cross-site forms cannot set it)
export const csrfGuard = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') return next(new HttpError(403, 'Blocked (CSRF)'));
  next();
};
