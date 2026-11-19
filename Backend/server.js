// Backend/server.js
import app from './app.js';
import { ENV } from './config/env.js';
import { testConnection, closePool } from './config/db.js';

async function startServer() {
  console.log(`Starting KuralTN Backend on port ${ENV.PORT} (${ENV.NODE_ENV})`);

  // Verify MySQL connection on startup (non-fatal if DB is offline)
  await testConnection();

  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`KuralTN Backend listening at http://0.0.0.0:${ENV.PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, closing server...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});