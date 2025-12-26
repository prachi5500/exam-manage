import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated (you'll implement this later)
  const isAuthenticated = false

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />
  }

  return children
}

export default ProtectedRoute


// // export default ProtectedRoute
// import React, { useState, useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import api from '../services/api';

// const ProtectedRoute = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       // Check if user is authenticated via backend API
//       await api.get('/api/verify');
//       setIsAuthenticated(true);
//     } catch (error) {
//       setIsAuthenticated(false);
//       if (error.response?.status === 401) {
//         toast.error('Please login to continue');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

