// Backend/middleware/validateRequest.js
import { AppError } from '../utils/AppError.js';

export function validateRequest(schemaFn) {
  return (req, res, next) => {
    const errors = schemaFn(req.body);
    if (errors && errors.length > 0) {
      return next(new AppError('Validation error', 422, errors));
    }
    next();
  };
}
