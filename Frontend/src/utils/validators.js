// Frontend/src/utils/validators.js
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidIndianPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''));
}

export function isValidPincode(pincode) {
  return /^[1-9][0-9]{5}$/.test(pincode);
}
