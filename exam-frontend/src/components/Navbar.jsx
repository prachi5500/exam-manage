// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import AccountIcon from './AccountIcon'; 

// const Navbar = () => {

//     const [userRole, setUserRole] = useState('user');
//     const navigate = useNavigate();
    
//     // Component mount pe user role check karo
//     useEffect(() => {
//         // Simple check - aap baad mein token-based karna
//         const savedUser = localStorage.getItem('user'); // Temporary
//         if (savedUser) {
//             const parsedUser = JSON.parse(savedUser);
//             setUserRole(parsedUser.role || 'user');
//         }
//     }, []);
    
//     const handleLogout = () => {
//         localStorage.removeItem('user');
//         navigate('/login');
//     };
    
//     return (
//         <nav className="bg-blue-600 text-white p-4">
//             <div className="container mx-auto flex justify-between items-center">
//                 <h1 className="text-xl font-bold">College Exam System</h1>
//                 <div className="flex space-x-4">
//                     <Link to="/" className="text-sm hover:underline">Home</Link>
//                     {/* <Link to="/exam-selection" className="text-sm hover:underline">Exam</Link> */}
//                     <Link to="/results" className="text-sm hover:underline">Results</Link>
//                      <AccountIcon />
//                      <Link to="/profile" className="text-sm hover:underline">Profile</Link>
//                      {/* ✅ Admin link sirf admin ke liye */}
//                     {userRole === 'admin' && (
//                         <Link to="/admin-dashboard" className="text-sm hover:underline">Admin Panel</Link>
//                     )}

//                      <button 
//                         onClick={handleLogout}
//                         className="text-sm px-2 py-1 rounded hover:bg-red-600"
//                     >
//                         Logout
//                     </button>


//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;


import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AccountIcon from './AccountIcon';
import { FaHome, FaChartBar, FaUser, FaBook, FaGraduationCap, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';

const Navbar = () => {
    const [userRole, setUserRole] = useState('user');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // User role check
    useEffect(() => {
        if (user) {
            setUserRole(user.role || 'user');
        }
    }, [user]);
    
    const isActive = (path) => {
        return location.pathname === path;
    };
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
        setIsMobileMenuOpen(false);
    };
    
    return (
        <>
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
                {/* Top gradient bar */}
                <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400"></div>
                
                {/* Main navbar */}
                <div className={`bg-gradient-to-r from-emerald-600 to-green-700 ${isScrolled ? 'py-3' : 'py-4'} transition-all duration-300`}>
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            
                            {/* Logo/Brand Section */}
                            <div className="flex items-center space-x-3">
                                <Link to="/" className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
                                        <FaGraduationCap className="text-3xl text-emerald-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white tracking-tight">
                                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                                                EduExam Pro
                                            </span>
                                        </h1>
                                        <p className="text-xs text-emerald-100 font-medium">
                                            Smart Learning Platform
                                        </p>
                                    </div>
                                </Link>
                            </div>
                            
                            {/* Desktop Navigation Links */}
                            <div className="hidden lg:flex items-center space-x-1">
                                {/* Home Link */}
                                <Link 
                                    to="/" 
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all ${isActive('/') ? 'bg-emerald-700 text-white shadow-md' : 'text-emerald-100 hover:bg-emerald-500/30 hover:text-white'}`}
                                >
                                    <FaHome className="text-lg" />
                                    <span className="font-medium">Home</span>
                                </Link>
                                
                                {/* Exam Link */}
                                <Link 
                                    to="/exam-selection" 
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all ${isActive('/exam-selection') ? 'bg-emerald-700 text-white shadow-md' : 'text-emerald-100 hover:bg-emerald-500/30 hover:text-white'}`}
                                >
                                    <FaBook className="text-lg" />
                                    <span className="font-medium">Exams</span>
                                </Link>
                                
                                {/* Results Link */}
                                <Link 
                                    to="/results" 
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all ${isActive('/results') ? 'bg-emerald-700 text-white shadow-md' : 'text-emerald-100 hover:bg-emerald-500/30 hover:text-white'}`}
                                >
                                    <FaChartBar className="text-lg" />
                                    <span className="font-medium">Results</span>
                                </Link>
                                
                                {/* Profile Link */}
                                <Link 
                                    to="/profile" 
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all ${isActive('/profile') ? 'bg-emerald-700 text-white shadow-md' : 'text-emerald-100 hover:bg-emerald-500/30 hover:text-white'}`}
                                >
                                    <FaUser className="text-lg" />
                                    <span className="font-medium">Profile</span>
                                </Link>
                                
                                {/* Admin Panel - Only for admin users */}
                                {user && userRole === 'admin' && (
                                    <Link 
                                        to="/admin-dashboard" 
                                        className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md transition-all"
                                    >
                                        <span className="font-medium">Admin Panel</span>
                                    </Link>
                                )}
                                
                                {/* Login/Register buttons for non-logged in users */}
                                {!user ? (
                                    <>
                                        <Link 
                                            to="/login" 
                                            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-md transition-all"
                                        >
                                            <FiLogIn className="text-lg" />
                                            <span className="font-medium">Login</span>
                                        </Link>
                                        
                                        <Link 
                                            to="/register" 
                                            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md transition-all"
                                        >
                                            <FaUserPlus className="text-lg" />
                                            <span className="font-medium">Register</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/* Logout Button */}
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-md transition-all"
                                        >
                                            <span className="font-medium">Logout</span>
                                        </button>
                                        
                                        {/* Account Icon */}
                                        <div className="ml-2">
                                            <AccountIcon />
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {/* Mobile Menu Button */}
                            <div className="lg:hidden flex items-center space-x-3">
                                {user ? (
                                    <>
                                        <AccountIcon />
                                        <button 
                                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                            className="text-white p-2 rounded-lg hover:bg-emerald-500/30"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isMobileMenuOpen ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                )}
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <Link 
                                        to="/login" 
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-md"
                                    >
                                        <FiLogIn />
                                        <span>Login</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Bottom decorative line */}
                <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 opacity-50"></div>
            </nav>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
                    <div className="absolute top-20 right-4 w-64 bg-white rounded-xl shadow-2xl overflow-hidden">
                        {/* User Info */}
                        {user && (
                            <div className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                        <span className="text-emerald-600 font-bold text-lg">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-xs opacity-90">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Mobile Menu Links */}
                        <div className="py-2">
                            <Link 
                                to="/" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 ${isActive('/') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <FaHome className="text-lg" />
                                <span>Home</span>
                            </Link>
                            
                            <Link 
                                to="/exam-selection" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 ${isActive('/exam-selection') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <FaBook className="text-lg" />
                                <span>Exams</span>
                            </Link>
                            
                            <Link 
                                to="/results" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 ${isActive('/results') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <FaChartBar className="text-lg" />
                                <span>Results</span>
                            </Link>
                            
                            <Link 
                                to="/profile" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 ${isActive('/profile') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <FaUser className="text-lg" />
                                <span>Profile</span>
                            </Link>
                            
                            {user && userRole === 'admin' && (
                                <Link 
                                    to="/admin-dashboard" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100"
                                >
                                    <span className="font-medium">Admin Panel</span>
                                </Link>
                            )}
                            
                            {/* Login/Register for non-logged in users */}
                            {!user ? (
                                <>
                                    <Link 
                                        to="/login" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 hover:from-blue-100 hover:to-cyan-100"
                                    >
                                        <FiLogIn />
                                        <span>Login</span>
                                    </Link>
                                    
                                    <Link 
                                        to="/register" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                                    >
                                        <FaUserPlus />
                                        <span>Register</span>
                                    </Link>
                                </>
                            ) : (
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 border-t"
                                >
                                    <span>Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Close menu when clicking outside */}
                    <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            )}
        </>
    );
};

export default Navbar;