// Backend/services/uploadService.js
import path from 'path';
import fs from 'fs';
import { UPLOAD_CONFIG } from '../config/upload.js';
import { AppError } from '../utils/AppError.js';

export const uploadService = {
  getPrivateFilePath(fileName) {
    const fullPath = path.resolve(UPLOAD_CONFIG.PRIVATE_DIR, path.basename(fileName));
    if (!fs.existsSync(fullPath)) {
      throw new AppError('Requested evidence file not found on secure server', 404);
    }
    return fullPath;
  },
};
