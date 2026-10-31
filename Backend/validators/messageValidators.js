// Backend/validators/messageValidators.js
export function validateWardMessage(data) {
  const errors = [];
  if (!data.message_text || data.message_text.trim().length < 1) {
    errors.push({ field: 'message_text', message: 'Message text cannot be empty' });
  }
  return errors;
}

export function validateWardAnnouncement(data) {
  const errors = [];
  if (!data.title || data.title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Announcement title must be at least 5 characters' });
  }
  if (!data.content || data.content.trim().length < 10) {
    errors.push({ field: 'content', message: 'Announcement content must be at least 10 characters' });
  }
  return errors;
}
