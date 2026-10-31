// server.js (Full-Stack Entry Point for AI Studio Runtime)
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import app from './Backend/app.js';
import { ENV } from './Backend/config/env.js';
import { initSocketIO } from './Backend/config/socket.js';
import { setupSocketIO } from './Backend/sockets/index.js';
import { initDB } from './Backend/config/db.js';
import { startDeadlineMonitor } from './Backend/jobs/deadlineMonitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
initDB();

const server = http.createServer(app);

// Setup Socket.IO
const io = initSocketIO(server);
setupSocketIO(io);

// Start Automated Background Jobs
startDeadlineMonitor(60000);

// CLI args parse or default to 3000 (guarding against 8080 which is reserved by Nginx)
const args = process.argv.slice(2);
const portArgIndex = args.indexOf('--port');
const cliPort = portArgIndex !== -1 && args[portArgIndex + 1] ? parseInt(args[portArgIndex + 1], 10) : null;
const PORT = cliPort || (process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000);
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  if (!isProd) {
    // Mount Vite dev server middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built static client files
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      const express = (await import('express')).default;
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
          return next();
        }
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Civic Grievance System] Live on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
