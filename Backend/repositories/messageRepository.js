// Backend/repositories/messageRepository.js
import { getDB, persistDB } from '../config/db.js';

export const messageRepository = {
  findMessagesByWard(wardId, limit = 50) {
    const db = getDB();
    return db.messages
      .filter((m) => m.ward_id === wardId && !m.is_moderated)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-limit);
  },

  createMessage(data) {
    const db = getDB();
    const now = new Date().toISOString();
    const id = `msg-${Date.now()}`;

    const newMsg = {
      id,
      ward_id: data.ward_id,
      sender_user_id: data.sender_user_id,
      sender_name: data.sender_name,
      sender_role: data.sender_role,
      message_text: data.message_text,
      complaint_ref_link: data.complaint_ref_link || null,
      is_announcement: data.is_announcement || false,
      is_moderated: false,
      created_at: now,
    };

    db.messages.push(newMsg);
    persistDB();
    return newMsg;
  },

  findAnnouncementsByWard(wardId) {
    const db = getDB();
    return db.ward_announcements
      .filter((a) => a.ward_id === wardId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  createAnnouncement(data) {
    const db = getDB();
    const now = new Date().toISOString();
    const id = `wa-${Date.now()}`;

    const announcement = {
      id,
      ward_id: data.ward_id,
      author_user_id: data.author_user_id,
      title: data.title,
      content: data.content,
      priority: data.priority || 'NORMAL',
      expires_at: data.expires_at || null,
      created_at: now,
    };

    db.ward_announcements.unshift(announcement);
    persistDB();
    return announcement;
  },
};
