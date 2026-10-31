// Backend/config/jwt.js
import { ENV } from './env.js';

export const JWT_CONFIG = {
  accessSecret: ENV.JWT.ACCESS_SECRET,
  refreshSecret: ENV.JWT.REFRESH_SECRET,
  accessExpiresIn: ENV.JWT.ACCESS_EXPIRES_IN,
  refreshExpiresIn: `${ENV.JWT.REFRESH_EXPIRES_IN_DAYS}d`,
  cookieName: 'tn_civic_refresh_token',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: (ENV.JWT?.REFRESH_EXPIRES_IN_DAYS || 7) * 24 * 60 * 60 * 1000,
  },
};
