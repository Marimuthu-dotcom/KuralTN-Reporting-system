// Backend/config/env.js
import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'kuraltn',
    POOL_LIMIT: process.env.DB_POOL_LIMIT || 10,
  },
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'tn_civic_access_secret_key_prod_2026_secured',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'tn_civic_refresh_secret_key_prod_2026_secured',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '2h',
    REFRESH_EXPIRES_IN_DAYS: 7,
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  CLIENT_URL: process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000',
};
