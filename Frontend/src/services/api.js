// Frontend/src/services/api.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAccessToken() {}
export function getAccessToken() {
  return null;
}
export function setTokenRefreshFailedCallback() {}

export default api;