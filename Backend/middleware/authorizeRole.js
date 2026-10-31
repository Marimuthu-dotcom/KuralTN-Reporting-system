// Backend/middleware/authorizeRole.js
import { AppError } from '../utils/AppError.js';

export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (req.user.approval_status === 'PENDING_APPROVAL' || req.user.role === 'PENDING') {
      return next(
        new AppError(
          'Access forbidden: Your account is pending administrator approval and role assignment.',
          403,
          'ACCOUNT_PENDING_APPROVAL'
        )
      );
    }

    const normalize = (r) => (r === 'SYSTEM_ADMIN' ? 'ADMIN' : r);
    const userRole = normalize(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalize);

    if (!normalizedAllowed.includes(userRole)) {
      return next(
        new AppError(
          `Access forbidden: Role '${req.user.role}' is not authorized to perform this operation.`,
          403
        )
      );
    }

    next();
  };
}
