// Backend/middleware/notFound.js
import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`API endpoint not found: ${req.method} ${req.originalUrl}`, 404));
}
