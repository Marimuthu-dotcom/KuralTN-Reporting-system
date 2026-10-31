// Backend/validators/authValidators.js
export function validateGoogleAuth(data) {
  const errors = [];
  if (!data.credential && !data.demo_user_id) {
    errors.push({ field: 'credential', message: 'Google credential or demo_user_id is required' });
  }
  return errors;
}

export function validateOnboarding(data) {
  const errors = [];
  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push({ field: 'full_name', message: 'Full name must be at least 2 characters' });
  }
  if (!data.ward_id) {
    errors.push({ field: 'ward_id', message: 'Ward selection is required' });
  }
  return errors;
}
