// Backend/repositories/notificationRepository.js
import { getDB, persistDB } from '../config/db.js';

export const notificationRepository = {
  findByUser(userId) {
    const db = getDB();
    return db.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  create(data) {
    const db = getDB();
    const now = new Date().toISOString();
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const notif = {
      id,
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      related_entity_type: data.related_entity_type || null,
      related_entity_id: data.related_entity_id || null,
      is_read: false,
      read_at: null,
      created_at: now,
    };

    db.notifications.unshift(notif);
    persistDB();
    return notif;
  },

  markAsRead(notificationId, userId) {
    const db = getDB();
    const notif = db.notifications.find((n) => n.id === notificationId && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
      persistDB();
    }
    return notif;
  },

  markAllAsRead(userId) {
    const db = getDB();
    const now = new Date().toISOString();
    let count = 0;
    db.notifications.forEach((n) => {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        n.read_at = now;
        count++;
      }
    });
    persistDB();
    return count;
  },
};
