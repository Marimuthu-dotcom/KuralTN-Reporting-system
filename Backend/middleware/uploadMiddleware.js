// Backend/middleware/uploadMiddleware.js
import multer from 'multer';
import { UPLOAD_CONFIG } from '../config/upload.js';
import { sanitizeFileName } from '../utils/fileSecurity.js';
import { AppError } from '../utils/AppError.js';

// Public complaint images storage
const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_CONFIG.PUBLIC_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFileName(file.originalname));
  },
});

// Private accountability evidence storage (isolated!)
const privateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_CONFIG.PRIVATE_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFileName(file.originalname));
  },
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file format: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`, 400), false);
  }
};

export const uploadPublicImages = multer({
  storage: publicStorage,
  limits: { fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE, files: 5 },
  fileFilter: fileFilter(UPLOAD_CONFIG.ALLOWED_IMAGE_MIMES),
});

export const uploadPrivateEvidence = multer({
  storage: privateStorage,
  limits: { fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE, files: 5 },
  fileFilter: fileFilter(UPLOAD_CONFIG.ALLOWED_DOC_MIMES),
});
