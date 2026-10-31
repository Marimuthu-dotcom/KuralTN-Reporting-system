// Backend/validators/commentValidators.js
export function validateComment(data) {
  const errors = [];
  if (!data.comment_text || data.comment_text.trim().length < 2) {
    errors.push({ field: 'comment_text', message: 'Comment text cannot be empty' });
  }
  return errors;
}
