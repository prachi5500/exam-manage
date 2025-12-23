import axios from 'axios';

// Simple configuration - NO withCredentials for now
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  }
  // withCredentials: false रखें (temporary)
});

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('📤 Sending to:', 'http://localhost:3000/auth/register');
      console.log('📦 Data:', userData);
      
      const response = await api.post('/auth/register', userData);
      console.log('✅ Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Return actual error from backend
      if (error.response?.data) {
        return error.response.data;
      }
      
      return { 
        success: false, 
        message: 'Registration failed. Please try again.' 
      };
    }
  },

  verifyEmail: async (code) => {
    try {
      const response = await api.post('/auth/verifyEmail', { code });
      return response.data;
    } catch (error) {
      console.error('Verify Email Error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Verification failed.' 
      };
    }
  },
// };


// login

  // NEW FUNCTIONS
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Login failed' 
      };
    }
  },
  
  forgotPassword : async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Request failed' 
      };
    }
  },
   verifyResetOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { 
        email, 
        otp 
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'OTP verification failed' 
      };
    }
  },
  
  resetPassword : async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Reset failed' 
      };
    }
  },


};




export default api;