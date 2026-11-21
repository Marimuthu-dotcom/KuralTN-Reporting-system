// Backend/middleware/rateLimiter.js
const requestCounts = new Map();

export function rateLimiter({ windowMs = 60000, max = 120 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(ip, record);

    if (record.count > max) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests. Please slow down and try again later.',
      });
    }

    next();
  };
}
