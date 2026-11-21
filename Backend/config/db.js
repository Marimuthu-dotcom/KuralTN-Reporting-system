
import mysql from 'mysql2/promise';
import { ENV } from './env.js';

// Database connection pool
let pool = null;

// Database connection status
const DB_STATE = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
};

let dbState = DB_STATE.DISCONNECTED;
let healthTimer = null;

// Create MySQL connection pool
export function createPool() {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: ENV.DB.HOST,
    port: Number(ENV.DB.PORT),
    user: ENV.DB.USER,
    password: ENV.DB.PASSWORD,
    database: ENV.DB.NAME,

    waitForConnections: true,
    connectionLimit: Number(ENV.DB.POOL_LIMIT || 10),
    queueLimit: 0,

    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    timezone: 'Z',
    charset: 'utf8mb4',
  });

  return pool;
}

// Check whether MySQL is responding
export async function pingDB() {
  if (!pool) {
    return false;
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();

    return true;
  } catch (error) {
    console.error('MySQL ping failed:', error.message);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Get the current database connection status
export function getDBState() {
  return dbState;
}

// Check whether MySQL is connected
export function isUsingMySQL() {
  return dbState === DB_STATE.CONNECTED;
}

// Get the initialized connection pool
function getPool() {
  if (!pool) {
    throw new Error(
      'Database is not initialized. Call initDB() first.'
    );
  }

  return pool;
}

// Execute an SQL query
export async function query(sql, params = []) {
  const connectionPool = getPool();

  const [result] = await connectionPool.execute(
    sql,
    params
  );

  return result;
}

// Execute multiple queries as one transaction
export async function withTransaction(callback) {
  const connectionPool = getPool();

  const connection = await connectionPool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();

    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        'Transaction rollback failed:',
        rollbackError.message
      );
    }

    throw error;
  } finally {
    connection.release();
  }
}

// Monitor database connection
function startHealthCheck() {
  if (healthTimer) {
    return;
  }

  healthTimer = setInterval(async () => {
    const connected = await pingDB();

    if (connected) {
      if (dbState !== DB_STATE.CONNECTED) {
        dbState = DB_STATE.CONNECTED;
        console.log('MySQL connection restored');
      }
    } else {
      if (dbState !== DB_STATE.DISCONNECTED) {
        dbState = DB_STATE.DISCONNECTED;
        console.error('MySQL connection lost');
      }
    }
  }, 30000);

  // Do not keep Node.js running only because of this timer
  healthTimer.unref?.();
}

// Initialize the database
export async function initDB() {
  try {
    createPool();

    const connected = await pingDB();

    if (!connected) {
      throw new Error('Unable to connect to MySQL');
    }

    dbState = DB_STATE.CONNECTED;

    console.log('✅ MySQL connected successfully');
    console.log(`🚀 Database: ${ENV.DB.NAME}`);

    startHealthCheck();

    return {
      state: dbState,
    };
  } catch (error) {
    dbState = DB_STATE.DISCONNECTED;

    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }

    console.error('Database initialization failed:', error.message);

    throw error;
  }
}

// Close database connection during server shutdown
export async function closePool() {
  if (healthTimer) {
    clearInterval(healthTimer);
    healthTimer = null;
  }

  if (pool) {
    await pool.end();
    pool = null;
  }

  dbState = DB_STATE.DISCONNECTED;

  console.log('MySQL connection pool closed');
}

// Default export
export default {
  initDB,
  createPool,
  pingDB,
  query,
  withTransaction,
  getDBState,
  isUsingMySQL,
  closePool,
};
