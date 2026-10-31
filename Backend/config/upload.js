// Backend/config/upload.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_CONFIG = {
  PUBLIC_DIR: path.resolve(__dirname, '../uploads/public'),
  PRIVATE_DIR: path.resolve(__dirname, '../uploads/private'),
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOC_MIMES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

// Ensure directories exist
if (!fs.existsSync(UPLOAD_CONFIG.PUBLIC_DIR)) {
  fs.mkdirSync(UPLOAD_CONFIG.PUBLIC_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_CONFIG.PRIVATE_DIR)) {
  fs.mkdirSync(UPLOAD_CONFIG.PRIVATE_DIR, { recursive: true });
}
