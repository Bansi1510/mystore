import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: localStorage.getItem('user_role') ? { role: localStorage.getItem('user_role') } : null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('auth_token')),
  isLoading: false,
  error: null,

  login: async (password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { password });
      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role);

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, role: user.role };
    } catch (err) {
      let message = 'Login failed. Please check your password.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Unable to connect to backend server. Please verify backend on port 5050.';
      }
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      set({ user: null, token: null, isAuthenticated: false, error: null });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        set({ user: res.data.user, isAuthenticated: true });
        localStorage.setItem('user_role', res.data.user.role);
      }
    } catch (e) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
