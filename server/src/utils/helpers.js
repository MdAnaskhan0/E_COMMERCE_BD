export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const validate = (schema) => (req, res, next) => { req.body = schema.parse(req.body); next(); };
import crypto from 'crypto';
export const orderNo = () => 'ORD-' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(4).toString('hex').toUpperCase(); // unguessable (needed because tracking uses only the order no.)

// ---- paging helpers: every list endpoint is paged on the SERVER so it never sends a whole table ----
export const int = (v, def, min, max) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
export const like = (s) => '%' + String(s).slice(0, 80).replace(/[\\%_]/g, '\\$&') + '%'; // user text is escaped so % and _ are literal
export const pageOf = (req, defLimit = 20, maxLimit = 100) => { const page = int(req.query.page, 1, 1, 100000), limit = int(req.query.limit, defLimit, 1, maxLimit); return { page, limit, offset: (page - 1) * limit }; };
export const paged = (items, total, { page, limit }) => ({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)), hasMore: page * limit < total });
