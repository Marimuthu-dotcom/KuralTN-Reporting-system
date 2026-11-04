// Backend/sockets/socketAuth.js
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { getDB } from '../config/db.js';

export function socketAuthMiddleware(socket, next) 
{
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    // Allow guest socket for public feed updates, but mark unauthenticated
    socket.user = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const db = getDB();
    const user = db.users.find((u) => u.id === decoded.userId && u.is_active);

    if (user) 
    {
      socket.user = user;
    } 
    else 
    {
      socket.user = null;
    }
  } 
  catch (err) 
 {
    socket.user = null;
  }

  next();
}

