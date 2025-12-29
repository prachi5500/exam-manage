import React, { createContext, useState, useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    
    
    checkAuthStatus();
  }, []);

//   const checkAuthStatus = async () => {
//     try {
//       setLoading(true);
      
//       // ✅ authAPI.checkLogin() call करें
//       const result = await authAPI.checkLogin();
      
//       console.log('Auth check result:', result);
      
//      if (result?.loggedIn && result?.user) {
//   setUser(result.user);   // 🔥 THIS LINE FIXES EVERYTHING
// } else {
//   setUser(null);
// }
//     } catch (error) {
//       console.error('Auth check error:', error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };
const checkAuthStatus = async () => {
  try {
    setLoading(true);
    
    // ✅ पहले localStorage check करें
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    console.log('🔍 Checking auth status...');
    console.log('Token in storage:', token ? 'Present' : 'Not found');
    console.log('User in storage:', userStr);
    
    // अगर token नहीं है तो API call भी न करें
    if (!token) {
      console.log('❌ No token found in localStorage');
      setUser(null);
      setLoading(false);
      return;
    }
    
    // ✅ अगर token है तो API call करें
    console.log('📞 Calling checkLogin API...');
    const result = await authAPI.checkLogin();
    console.log('✅ Auth check result:', result);
    
    if (result?.loggedIn && result?.user) {
      setUser(result.user);
      console.log('✅ User logged in:', result.user.email);
    } else {
      // अगर API fail करता है, localStorage clear करें
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      console.log('❌ Not logged in (API response)');
    }
    
  } catch (error) {
    console.error('❌ Auth check error:', error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  // const login = async (email, password) => {
  //   try {
  //     // ✅ authAPI.login() call करें
  //     const result = await authAPI.login({ email, password });
      
  //      if (result.success && result.user) {
  //     setUser(result.user);   // 🔥 IMMEDIATE SET
  //     setLoading(false);
  //       return { success: true, data: result.user || result };
  //     } else {
  //       return { success: false, message: result.message };
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     return { success: false, message: 'Network error' };
  //   }
  // };
  // AuthContext.jsx के login function में update करें:
const login = async (email, password) => {
  try {
      console.log('🔄 AuthContext: Logging in...');
    const result = await authAPI.login({ email, password });
     console.log('📦 Login result:', result);
    if (result.success && result.token) {
      // ✅ TOKEN को localStorage में save करें
      localStorage.setItem('authToken', result.token);
      
      // ✅ USER data भी save करें
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
      }
      
      setLoading(false);
      return { success: true, user: result.user };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error' };
  }
};

 

 
  const logout = async () => {
    try {
      // ✅ authAPI.logout() call کریں
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // navigate('/login');
    }
  };
   const value = {
    user,
    loading,
    login,
      logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};