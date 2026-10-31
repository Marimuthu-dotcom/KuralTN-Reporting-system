// Backend/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsOptions } from './config/cors.js';
import { UPLOAD_CONFIG } from './config/upload.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import districtRoutes from './routes/districtRoutes.js';
import localBodyRoutes from './routes/localBodyRoutes.js';
import wardRoutes from './routes/wardRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import escalationRoutes from './routes/escalationRoutes.js';
import accountabilityRoutes from './routes/accountabilityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use(rateLimiter({ windowMs: 60000, max: 200 }));

// Public uploads static serving (Complaint photos only)
app.use('/uploads/public', express.static(UPLOAD_CONFIG.PUBLIC_DIR));
// Notice: UPLOAD_CONFIG.PRIVATE_DIR is intentionally NEVER mounted as static!

// REST API routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/local-bodies', localBodyRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/accountability', accountabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
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
