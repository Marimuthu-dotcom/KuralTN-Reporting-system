// Backend/utils/tokenUtils.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_CONFIG } from '../config/jwt.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_CONFIG.accessSecret, {
    expiresIn: JWT_CONFIG.accessExpiresIn,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
    expiresIn: JWT_CONFIG.refreshExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_CONFIG.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_CONFIG.refreshSecret);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
