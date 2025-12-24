import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AccountIcon = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Context से user लें
  
  // ✅ Simple logic
  const handleIconClick = () => {
    if (!user) {
      // User login नहीं है → Login page
      navigate('/login');
    } else {
      // User login है → Profile page
      navigate('/profile');
    }
  };

  return (
    <div className="relative">
      {/* Account Icon Button */}
      <button 
        onClick={handleIconClick}
        className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors group"
      >
        <div className="relative">
          <FaUserCircle className="text-2xl group-hover:scale-110 transition-transform" />
          {user && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        {user ? (
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
            <span className="text-xs text-blue-200">
              {user.role === 'admin' ? 'Admin' : 'Student'}
            </span>
          </div>
        ) : (
          <span className="hidden md:inline text-sm">Login</span>
        )}
      </button>
    </div>
  );
};

export default AccountIcon;