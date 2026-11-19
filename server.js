// server.js (Full-Stack Entry Point for AI Studio Runtime)
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import app from './Backend/app.js';
import { testConnection } from './Backend/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const portArgIndex = args.indexOf('--port');
const cliPort = portArgIndex !== -1 && args[portArgIndex + 1] ? parseInt(args[portArgIndex + 1], 10) : null;
const PORT = cliPort || (process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000);
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  // Check MySQL connectivity without blocking startup if offline
  await testConnection();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: path.resolve(__dirname, 'Frontend'),
      configFile: path.resolve(__dirname, 'Frontend/vite.config.js'),
      server: {
        middlewareMode: true,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const frontendDistPath = path.resolve(__dirname, 'Frontend/dist');
    const rootDistPath = path.resolve(__dirname, 'dist');
    const distPath = fs.existsSync(frontendDistPath) ? frontendDistPath : rootDistPath;
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

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[KuralTN] Server live on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
