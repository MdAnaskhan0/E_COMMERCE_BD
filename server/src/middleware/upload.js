import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
export const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
export const upload = multer({
  storage: multer.diskStorage({ destination: uploadsDir, filename: (_r, f, cb) => cb(null, crypto.randomBytes(16).toString('hex') + ext[f.mimetype]) }),
  limits: { fileSize: 3 * 1024 * 1024, files: 8 },
  fileFilter: (_r, f, cb) => (ext[f.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP images allowed'))),
});
