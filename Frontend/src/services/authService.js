// Frontend/src/services/authService.js
import api, { setAccessToken } from './api.js';

export const authService = {
  async register({ full_name, email, username, password, confirm_password }) 
  {
    const res = await api.post('/auth/register', {
      full_name,
      email,
      username,
      password,
      confirm_password,
    });
    const { user, accessToken, refreshToken, authStatus, redirectTo } = res.data.data;
    setAccessToken(accessToken);
    if (user) localStorage.setItem('civic_user', JSON.stringify(user));
    if (refreshToken) localStorage.setItem('civic_refresh_token', refreshToken);
    return { user, accessToken, refreshToken, authStatus, redirectTo };
  },

  async login({ identifier, password }) 
  {
    const res = await api.post('/auth/login', {
      identifier,
      password,
    });
    const { user, accessToken, refreshToken, authStatus, redirectTo } = res.data.data;
    setAccessToken(accessToken);
    if (user) localStorage.setItem('civic_user', JSON.stringify(user));
    if (refreshToken) localStorage.setItem('civic_refresh_token', refreshToken);
    return { user, accessToken, refreshToken, authStatus, redirectTo };
  },

  async loginWithGoogle(credential, demoUserId = null, mode = 'register', invitationToken = null) {
    const res = await api.post('/auth/google', {
      credential,
      demo_user_id: demoUserId,
      mode,
      invitation_token: invitationToken,
    });
    const { user, accessToken, refreshToken, authStatus, redirectTo } = res.data.data;
    setAccessToken(accessToken);
    if (user) 
      localStorage.setItem('civic_user', JSON.stringify(user));
    if (refreshToken) 
      localStorage.setItem('civic_refresh_token', refreshToken);
    return { user, accessToken, refreshToken, authStatus, redirectTo };
  },

  async getInvitation(token) {
    const res = await api.get(`/auth/invitation/${encodeURIComponent(token)}`);
    return res.data.data;
  },

  async acceptInvitation({ token, password, full_name, username }) {
    const res = await api.post('/auth/invitation/accept', {
      token,
      password,
      full_name,
      username,
    });
    const { user, accessToken, refreshToken, redirectTo } = res.data.data;
    setAccessToken(accessToken);
    if (user) localStorage.setItem('civic_user', JSON.stringify(user));
    if (refreshToken) localStorage.setItem('civic_refresh_token', refreshToken);
    return { user, accessToken, refreshToken, redirectTo };
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
