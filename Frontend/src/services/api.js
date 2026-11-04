// Frontend/src/services/api.js
import axios from 'axios';

// In-memory access token storage with localStorage resilience
let currentAccessToken = localStorage.getItem('civic_access_token') || null;
let onTokenRefreshFailedCallback = null;

// Demo sessions use non-JWT placeholder tokens. They must never be sent to the
// backend and must never trigger the refresh flow.
const DEMO_TOKEN_PREFIX = 'demo-token-';
const DEMO_REFRESH_PREFIX = 'demo-refresh-';

function isDemoToken(token) {
  return typeof token === 'string' && token.startsWith(DEMO_TOKEN_PREFIX);
}

function isDemoRefreshToken(token) {
  return typeof token === 'string' && token.startsWith(DEMO_REFRESH_PREFIX);
}

export function setAccessToken(token) {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem('civic_access_token', token);
  } else {
    localStorage.removeItem('civic_access_token');
  }
}

export function getAccessToken() {
  return currentAccessToken || localStorage.getItem('civic_access_token');
}

export function setTokenRefreshFailedCallback(cb) {
  onTokenRefreshFailedCallback = cb;
}

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token from memory or localStorage
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    // Skip Authorization header for demo placeholder tokens — the backend
    // would reject them as invalid JWTs.
    if (token && !isDemoToken(token) && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Coordinated token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const activeToken = getAccessToken();
    const activeRefreshToken = localStorage.getItem('civic_refresh_token');

    // Demo sessions: never attempt refresh. Propagate the error so callers
    // (or mock-data fallbacks) can handle it without a 401 loop.
    if (isDemoToken(activeToken) || isDemoRefreshToken(activeRefreshToken)) {
      return Promise.reject(error);
    }

    // Check if error is 401 and request hasn't been retried yet
    const isAuthError = error.response && error.response.status === 401;
    const isExcludedEndpoint =
      originalRequest?.url?.includes('/auth/google') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout');

    if (isAuthError && !originalRequest._retry && !isExcludedEndpoint) {
      if (isRefreshing) {
        // Queue this request while refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('civic_refresh_token');
        if (!storedRefreshToken) {
          throw new Error('No stored refresh token');
        }
        // Demo refresh tokens cannot be exchanged — bail before hitting the API.
        if (isDemoRefreshToken(storedRefreshToken)) {
          throw new Error('Demo session does not support token refresh');
        }
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          {
            withCredentials: true,
            headers: {
              ...(storedRefreshToken ? { 'x-refresh-token': storedRefreshToken } : {}),
            },
          }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint');
        }

        setAccessToken(newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('civic_refresh_token', newRefreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        if (onTokenRefreshFailedCallback) {
          onTokenRefreshFailedCallback();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;