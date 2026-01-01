import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Fixed to 5000
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  checkLogin: async () => {
    try {
      const response = await api.get('/auth/check-login');
      return response.data;
    } catch (error) {
      return { loggedIn: false, message: error.message || 'Not logged in' };
    }
  },
  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Registration failed' };
    }
  },
  verifyEmail: async (code) => {
    try {
      const response = await api.post('/auth/verifyEmail', { code });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Verification failed' };
    }
  },
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token); // Keep for auth
      }
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Login failed' };
    }
  },
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Request failed' };
    }
  },
  verifyResetOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'OTP verification failed' };
    }
  },
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Reset failed' };
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('token');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return { success: true, message: 'Logged out' };
    }
  },
};

export default api;