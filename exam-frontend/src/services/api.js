// import axios from 'axios';

// // Simple configuration - NO withCredentials for now
// const api = axios.create({
//   baseURL: ['http://localhost:3000'||'http://localhost:3000'], // Backend URL
//   headers: {
//     'Content-Type': 'application/json',
//   }
  
// });

// export const authAPI = {
//   register: async (userData) => {
//     try {
//       console.log('📤 Sending to:', 'http://localhost:3000/auth/register');
//       console.log('📦 Data:', userData);
      
//       const response = await api.post('/auth/register', userData);
//       console.log('✅ Response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ API Error:', {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message
//       });
      
//       // Return actual error from backend
//       if (error.response?.data) {
//         return error.response.data;
//       }
      
//       return { 
//         success: false, 
//         message: 'Registration failed. Please try again.' 
//       };
//     }
//   },

//   verifyEmail: async (code) => {
//     try {
//       const response = await api.post('/auth/verifyEmail', { code });
//       return response.data;
//     } catch (error) {
//       console.error('Verify Email Error:', error);
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Verification failed.' 
//       };
//     }
//   },
// // };


// // login
 

//   // NEW FUNCTIONS
//   login: async (credentials) => {
//     try {
//       const response = await api.post('/auth/login', credentials);
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Login failed' 
//       };
//     }
//   },
  
//   forgotPassword : async (email) => {
//     try {
//       const response = await api.post('/auth/forgot-password', { email });
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Request failed' 
//       };
//     }
//   },
//    verifyResetOTP: async (email, otp) => {
//     try {
//       const response = await api.post('/auth/verify-reset-otp', { 
//         email, 
//         otp 
//       });
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'OTP verification failed' 
//       };
//     }
//   },
  
//   resetPassword : async (token, newPassword) => {
//     try {
//       const response = await api.post('/auth/reset-password', { 
//         token, 
//         newPassword 
//       });
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Reset failed' 
//       };
//     }
//   }


// };

// export default api;




// // import axios from 'axios';

// // // AWS-ready configuration
// // const api = axios.create({
// //   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// //   withCredentials: true, // Important for cookies
// // });

// // // Request interceptor for adding token
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // export const authAPI = {
// //   // Check login status
// //   checkLogin: async () => {
// //     try {
// //       const response = await api.get('/auth/check-login');
// //       return response.data;
// //     } catch (error) {
// //       console.error('Check login error:', error);
// //       return { loggedIn: false };
// //     }
// //   },

// //   // Login
// //   login: async (credentials) => {
// //     try {
// //       const response = await api.post('/auth/login', credentials);
      
// //       // Store token if returned
// //       if (response.data.token) {
// //         localStorage.setItem('token', response.data.token);
// //       }
      
// //       return response.data;
// //     } catch (error) {
// //       if (error.response?.data) {
// //         return error.response.data;
// //       }
// //       return { 
// //         success: false, 
// //         message: 'Login failed' 
// //       };
// //     }
// //   },

// //   // Logout
// //   logout: async () => {
// //     try {
// //       const response = await api.post('/auth/logout');
// //       localStorage.removeItem('token');
// //       return response.data;
// //     } catch (error) {
// //       console.error('Logout error:', error);
// //       localStorage.removeItem('token');
// //       return { 
// //         success: false, 
// //         message: 'Logout failed' 
// //       };
// //     }
// //   },

// //    register: async (userData) => {
// //     try {
// //       console.log('📤 Sending to:', 'http://localhost:3000/auth/register');
// //       console.log('📦 Data:', userData);
      
// //       const response = await api.post('/auth/register', userData);
// //       console.log('✅ Response:', response.data);
// //       return response.data;
// //     } catch (error) {
// //       console.error('❌ API Error:', {
// //         status: error.response?.status,
// //         data: error.response?.data,
// //         message: error.message
// //       });
      
// //       // Return actual error from backend
// //       if (error.response?.data) {
// //         return error.response.data;
// //       }
      
// //       return { 
// //         success: false, 
// //         message: 'Registration failed. Please try again.' 
// //       };
// //     }
// //   },

// //   verifyEmail: async (code) => {
// //     try {
// //       const response = await api.post('/auth/verifyEmail', { code });
// //       return response.data;
// //     } catch (error) {
// //       console.error('Verify Email Error:', error);
// //       if (error.response?.data) {
// //         return error.response.data;
// //       }
// //       return { 
// //         success: false, 
// //         message: 'Verification failed.' 
// //       };
// //     }
// //   },
// // // };



// // forgotPassword : async (email) => {
// //     try {
// //       const response = await api.post('/auth/forgot-password', { email });
// //       return response.data;
// //     } catch (error) {
// //       if (error.response?.data) {
// //         return error.response.data;
// //       }
// //       return { 
// //         success: false, 
// //         message: 'Request failed' 
// //       };
// //     }
// //   },
// //    verifyResetOTP: async (email, otp) => {
// //     try {
// //       const response = await api.post('/auth/verify-reset-otp', { 
// //         email, 
// //         otp 
// //       });
// //       return response.data;
// //     } catch (error) {
// //       if (error.response?.data) {
// //         return error.response.data;
// //       }
// //       return { 
// //         success: false, 
// //         message: 'OTP verification failed' 
// //       };
// //     }
// //   },
  
// //   resetPassword : async (token, newPassword) => {
// //     try {
// //       const response = await api.post('/auth/reset-password', { 
// //         token, 
// //         newPassword 
// //       });
// //       return response.data;
// //     } catch (error) {
// //       if (error.response?.data) {
// //         return error.response.data;
// //       }
// //       return { 
// //         success: false, 
// //         message: 'Reset failed' 
// //       };
// //     }
// //   }
// // };

// // export default api;




// import axios from 'axios';

// // AWS-ready configuration
// const api = axios.create({
//   baseURL: 'http://localhost:3000', // ✅ Port 5000
//   headers: {
//     'Content-Type': 'application/json',
//   }
//   // withCredentials: false रखें (temporary)
// });

// export const authAPI = {
//   // ✅ 1. ADD THIS FUNCTION - Check login status
//   checkLogin: async () => {
//     try {
//       const response = await api.get('/auth/check-login');
//       return response.data;
//     } catch (error) {
//       console.error('Check login error:', error);
      
//       // If connection refused, backend is not running
//       if (error.code === 'ERR_NETWORK' || error.message.includes('Connection refused')) {
//         return { 
//           loggedIn: false, 
//           message: 'Backend server not running' 
//         };
//       }
      
//       return { 
//         loggedIn: false,
//         message: 'Not logged in'
//       };
//     }
//   },

//   // ✅ 2. Login function
//   login: async (credentials) => {
//     try {
//       const response = await api.post('/auth/login', credentials);
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Login failed' 
//       };
//     }
//   },

//   // ✅ 3. Logout function
//   logout: async () => {
//     try {
//       const response = await api.post('/auth/logout');
//       return response.data;
//     } catch (error) {
//       console.error('Logout error:', error);
//       return { 
//         success: false, 
//         message: 'Logout failed' 
//       };
//     }
//   },

//   // ✅ 4. Existing functions...
//   register: async (userData) => {
//     try {
//       console.log('📤 Sending to:', 'http://localhost:3000/auth/register');
//       console.log('📦 Data:', userData);
      
//       const response = await api.post('/auth/register', userData);
//       console.log('✅ Response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ API Error:', {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message
//       });
      
//       if (error.response?.data) {
//         return error.response.data;
//       }
      
//       return { 
//         success: false, 
//         message: 'Registration failed. Please try again.' 
//       };
//     }
//   },

//   // ✅ 5. Verify Email
//   verifyEmail: async (code) => {
//     try {
//       const response = await api.post('/auth/verifyEmail', { code });
//       return response.data;
//     } catch (error) {
//       console.error('Verify Email Error:', error);
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Verification failed.' 
//       };
//     }
//   },
  
//   // ✅ 6. Forgot Password
//   forgotPassword: async (email) => {
//     try {
//       const response = await api.post('/auth/forgot-password', { email });
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Request failed' 
//       };
//     }
//   },

//   // ✅ 7. Verify Reset OTP
//   verifyResetOTP: async (email, otp) => {
//     try {
//       const response = await api.post('/auth/verify-reset-otp', { 
//         email, 
//         otp 
//       });
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'OTP verification failed' 
//       };
//     }
//   },
  
//   // ✅ 8. Reset Password
//   resetPassword: async (token, newPassword) => {
//     try {
//       const response = await api.post('/auth/reset-password', { 
//         token, 
//         newPassword 
//       });
//       return response.data;
//     } catch (error) {
//       if (error.response?.data) {
//         return error.response.data;
//       }
//       return { 
//         success: false, 
//         message: 'Reset failed' 
//       };
//     }
//   }
// };

// export default api;


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
  }


};

export default api;