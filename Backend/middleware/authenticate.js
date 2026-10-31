import { verifyAccessToken } from '../utils/tokenUtils.js';
import { AppError } from '../utils/AppError.js';
import { userRepository } from '../repositories/userRepository.js';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Missing Bearer token.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Authentication token missing.', 401));
    }

    const decoded = verifyAccessToken(token);
    const user = userRepository.findById(decoded.userId);

    if (!user || !user.is_active) {
      return next(new AppError('User belonging to this token no longer exists or is inactive.', 401));
    }

    if (user.approval_status === 'SUSPENDED') {
      return next(new AppError('Your account has been suspended by municipal administration.', 403));
    }

    if (user.approval_status === 'REJECTED') {
      return next(new AppError('Your account registration application was declined by the administrator.', 403));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired. Please refresh your session.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
}
