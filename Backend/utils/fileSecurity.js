// Backend/utils/fileSecurity.js
import path from 'path';

export function sanitizeFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${base}_${Date.now()}_${randomSuffix}${ext}`;
}

export function isAllowedMime(mimeType, allowedList) {
  return allowedList.includes(mimeType);
}
