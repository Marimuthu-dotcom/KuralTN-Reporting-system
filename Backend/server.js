// Backend/server.js
import http from 'http';
import app from './app.js';
import { ENV } from './config/env.js';
import { initSocketIO } from './config/socket.js';
import { setupSocketIO } from './sockets/index.js';
import { initDB, getDBState, closePool } from './config/db.js';
import { startDeadlineMonitor } from './jobs/deadlineMonitor.js';

const bootstrap = async () => {
  console.log('\n──────── Starting Backend ────────');
  console.log(`🌱 NODE_ENV : ${ENV.NODE_ENV}`);
  console.log(`🌱 PORT     : ${ENV.PORT}`);
  console.log(`🌱 DB_HOST  : ${ENV.DB.HOST}:${ENV.DB.PORT}`);
  console.log(`🌱 DB_NAME  : ${ENV.DB.NAME}`);
  console.log('──────────────────────────────────\n');

  // DB init — MySQL connect ஆனா health-check start,
  // fail ஆனா background-ல 30s reconnect loop start
  await initDB();
  console.log(`📊 Initial DB state: ${getDBState()}`);
  console.log('──────────────────────────────────\n');

  const server = http.createServer(app);

  const io = initSocketIO(server);
  setupSocketIO(io);

  // Background jobs — every 60s
  startDeadlineMonitor(60_000);

  // Real-time DB status endpoint
  app.get('/health', (_req, res) => {
    const state = getDBState();
    res.status(state === 'CONNECTED' ? 200 : 503).json({
      status: state === 'CONNECTED' ? 'ok' : 'degraded',
      database: state,
      timestamp: new Date().toISOString(),
    });
  });

  const PORT = ENV.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Civic Grievance Backend] Running on port ${PORT} in ${ENV.NODE_ENV} mode`);
  });

  // Graceful shutdown — timers + pool clean up
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

bootstrap().catch((err) => {
  console.error('❌ Fatal startup error:', err);
  process.exit(1);
});