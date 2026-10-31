// Frontend/src/services/userService.js
import api from './api.js';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/me');
    return res.data.data;
  },

  async updateProfile(data) {
    const res = await api.patch('/users/me', data);
    return res.data.data;
  },

  async completeOnboarding(data) {
    const res = await api.post('/users/onboard', data);
    return res.data.data;
  },

  async sendPhoneOtp(phone) {
    const res = await api.post('/users/send-phone-otp', { phone });
    return res.data.data;
  },

  async verifyPhoneOtp({ phone, otp }) {
    const res = await api.post('/users/verify-phone-otp', { phone, otp });
    return res.data.data;
  },
};

