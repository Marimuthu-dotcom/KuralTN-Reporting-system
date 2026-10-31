// Frontend/src/services/authService.js
import api, { setAccessToken } from './api.js';

export const authService = {
  async loginWithGoogle(credential, demoUserId = null) {
    const res = await api.post('/auth/google', {
      credential,
      demo_user_id: demoUserId,
    });
    const { user, accessToken, refreshToken, authStatus, redirectTo } = res.data.data;
    setAccessToken(accessToken);
    if (user) localStorage.setItem('civic_user', JSON.stringify(user));
    if (refreshToken) localStorage.setItem('civic_refresh_token', refreshToken);
    return { user, accessToken, refreshToken, authStatus, redirectTo };
  },

  async refreshToken(overrideToken = null) {
    const token = overrideToken || localStorage.getItem('civic_refresh_token');
    const res = await api.post('/auth/refresh', { refreshToken: token });
    const { user, accessToken, refreshToken: newRefreshToken } = res.data.data;
    setAccessToken(accessToken);
    if (user) localStorage.setItem('civic_user', JSON.stringify(user));
    if (newRefreshToken) localStorage.setItem('civic_refresh_token', newRefreshToken);
    return { user, accessToken, refreshToken: newRefreshToken };
  },

  async logout() {
    try {
      const token = localStorage.getItem('civic_refresh_token');
      await api.post('/auth/logout', { refreshToken: token });
    } finally {
      setAccessToken(null);
      localStorage.removeItem('civic_user');
      localStorage.removeItem('civic_refresh_token');
      localStorage.removeItem('civic_access_token');
    }
  },

  async getAccounts() {
    const res = await api.get("/auth/accounts");
    return res.data.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
