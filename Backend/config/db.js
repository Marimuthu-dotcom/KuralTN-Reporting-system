// Backend/config/db.js
import mysql from 'mysql2/promise';
import { ENV } from './env.js';

let pool = null;
let isConnected = false;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      database: ENV.DB.NAME,
      waitForConnections: true,
      connectionLimit: ENV.DB.POOL_LIMIT,
      queueLimit: 0,
      connectTimeout: 5000,
      charset: 'utf8mb4',
    });
  }
  return pool;
}

export async function testConnection() {
  try {
    const dbPool = getPool();
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log(`MySQL connected (${ENV.DB.HOST}:${ENV.DB.PORT}/${ENV.DB.NAME})`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`MySQL connection check failed (${err.message}). Server will continue running.`);
    return false;
  }
}

export function getDBStatus() {
  return isConnected ? 'CONNECTED' : 'DISCONNECTED';
}

export async function query(sql, params = []) {
  const dbPool = getPool();
  const [rows] = await dbPool.execute(sql, params);
  return rows;
}

export async function closePool() {
  if (pool) {
    try {
      await pool.end();
    } catch {
      // Ignore pool shutdown errors
    }
    pool = null;
    isConnected = false;
  }
}

export default {
  getPool,
  testConnection,
  getDBStatus,
  query,
  closePool,
};