// Backend/config/socket.js
import { Server } from 'socket.io';
import { corsOptions } from './cors.js';

let io = null;

export function initSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 30000,
    pingInterval: 10000,
  });
  return io;
}

export function getIO() {
  return io;
}
