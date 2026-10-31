// Backend/validators/userValidators.js
export function validateUserProfileUpdate(data) {
  const errors = [];
  if (data.phone && !/^[0-9+ -]{10,15}$/.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone number format' });
  }
  return errors;
}
