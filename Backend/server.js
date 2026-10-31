// Backend/server.js
import http from 'http';
import app from './app.js';
import { ENV } from './config/env.js';
import { initSocketIO } from './config/socket.js';
import { setupSocketIO } from './sockets/index.js';
import { initDB } from './config/db.js';
import { startDeadlineMonitor } from './jobs/deadlineMonitor.js';

// Initialize Database records
initDB();

const server = http.createServer(app);

// Setup WebSockets
const io = initSocketIO(server);
setupSocketIO(io);

// Start Automated Background Jobs (Overdue monitor)
startDeadlineMonitor(60000); // Checks every minute

const PORT = ENV.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Civic Grievance Backend] Running on port ${PORT} in ${ENV.NODE_ENV} mode`);
});
