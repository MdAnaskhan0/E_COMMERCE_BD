export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const validate = (schema) => (req, res, next) => { req.body = schema.parse(req.body); next(); };
import crypto from 'crypto';
export const orderNo = () => 'ORD-' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(4).toString('hex').toUpperCase(); // unguessable (needed because tracking uses only the order no.)
