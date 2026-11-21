import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import env from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

/**
 * Multer configured with memoryStorage so the uploaded bytes stay
 * available in req.file.buffer for the AI service (Phase 4).
 * User-supplied filenames are never trusted — stored names are
 * crypto-random with an extension derived from the verified MIME type.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Unsupported file type. Upload a JPG, PNG, WEBP or GIF image.'));
    }
  },
});

const MAGIC_BYTES = {
  'image/jpeg': (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b.length > 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  'image/gif': (b) =>
    b.length > 6 && (b.toString('ascii', 0, 6) === 'GIF87a' || b.toString('ascii', 0, 6) === 'GIF89a'),
  'image/webp': (b) =>
    b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
};

/**
 * Verifies the actual file bytes match the declared MIME type.
 * Multer's fileFilter only sees the client-supplied Content-Type header,
 * which is trivially spoofable — magic bytes are not.
 */
export const verifyImageContent = (buffer, mimetype) => {
  const check = MAGIC_BYTES[mimetype];
  if (!check || !check(buffer)) {
    throw new ApiError(400, 'Uploaded file content does not match a supported image format');
  }
};

const cloudinaryConfigured = () =>
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret;

/**
 * Persists an uploaded image buffer.
 * Uses Cloudinary when credentials are configured; otherwise writes to
 * server/uploads for local development. Returns { url, publicId }.
 */
export const storeImage = async (buffer, mimetype) => {
  if (!buffer || !mimetype) return { url: null, publicId: null };
  verifyImageContent(buffer, mimetype);

  if (cloudinaryConfigured()) {
    const { default: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
    const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'civiclens/complaints',
      resource_type: 'image',
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  const ext = ALLOWED_MIME_TYPES[mimetype] || 'bin';
  const filename = `${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(env.uploadsDir, filename);
  await fs.mkdir(env.uploadsDir, { recursive: true });
  await fs.writeFile(filePath, buffer);
  return { url: `/uploads/${filename}`, publicId: null };
};
