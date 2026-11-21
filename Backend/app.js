// Backend/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { corsOptions } from './config/cors.js';
// import { UPLOAD_CONFIG } from './config/upload.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(morgan('dev')); // HTTP request logging (for development only)
// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Frontend → Backend connection (CORS + cookies + body parsing)
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use(rateLimiter({ windowMs: 60000, max: 200 }));

// Public uploads static serving (Complaint photos only)
// app.use('/uploads/public', express.static(UPLOAD_CONFIG.PUBLIC_DIR));
// Notice: UPLOAD_CONFIG.PRIVATE_DIR is intentionally NEVER mounted as static!

// Health check endpoint (frontend uses this to verify backend is reachable)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'AI-Powered Civic Grievance System (Tamil Nadu)',
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;