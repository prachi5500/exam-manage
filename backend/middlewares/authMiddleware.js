// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// // Cookie-based authentication middleware
// export const authenticate = async (req, res, next) => {
//   try {
//     // First check cookies
//     let token = req.cookies?.token;
    
//     // If no cookie, check Authorization header (for flexibility)
//     if (!token && req.headers.authorization) {
//       token = req.headers.authorization.replace('Bearer ', '');
//     }
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please authenticate'
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Check if user exists
//     const user = await User.findById(decoded.userId).select('-password');
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Attach user info to request
//     req.user = {
//       userId: user._id.toString(),
//       email: user.email,
//       role: user.role,
//       name: user.name
//     };
    
//     next();
//   } catch (error) {
//     console.error('Authentication error:', error.message);
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token expired'
//       });
//     }
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token'
//       });
//     }
    
//     res.status(401).json({
//       success: false,
//       message: 'Please authenticate'
//     });
//   }
// };

// // Role-based authorization middleware
// export const authorize = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please authenticate first'
//       });
//     }
    
//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Required roles: ' + allowedRoles.join(', ')
//       });
//     }
    
//     next();
//   };
// };

// // Admin only middleware
// export const adminOnly = (req, res, next) => {
//   if (!req.user || req.user.role !== 'admin') {
//     return res.status(403).json({
//       success: false,
//       message: 'Admin access required'
//     });
//   }
//   next();
// };

// // Student only middleware
// export const studentOnly = (req, res, next) => {
//   if (!req.user || req.user.role !== 'student') {
//     return res.status(403).json({
//       success: false,
//       message: 'Student access required'
//     });
//   }
//   next();
// };

// // Teacher only middleware
// export const teacherOnly = (req, res, next) => {
//   if (!req.user || req.user.role !== 'teacher') {
//     return res.status(403).json({
//       success: false,
//       message: 'Teacher access required'
//     });
//   }
//   next();
// };









// import jwt from "jsonwebtoken";
// import { Usermodel } from "../models/User.js";


// const authMiddleware = (req, res, next) => {
//   const header = req.headers.authorization;

//   if (!header || !header.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = header.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 👇 decoded me wahi data hoga jo login time sign kiya tha
//     req.user = {
//       userId: decoded.userId,
//       role: decoded.role
//     };

//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// export default authMiddleware;




// import jwt from "jsonwebtoken";
// import { Usermodel } from "../models/User.js";

// const authMiddleware = async (req, res, next) => {
//   try {
//     // 🔥 COOKIE SE TOKEN LO
//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(401).json({ loggedIn: false });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔥 REAL USER DATABASE SE NIKALO
//     const user = await Usermodel.findById(decoded.userId).select("-password");

//     if (!user) {
//       return res.status(401).json({ loggedIn: false });
//     }

//     req.user =  {userId: decoded.userId,
//   role: user.role};   // 🔥 MOST IMPORTANT LINE
//     next();

//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     return res.status(401).json({ loggedIn: false });
//   }
// };

// export default authMiddleware;



import jwt from "jsonwebtoken";
import { Usermodel } from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({ loggedIn: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Usermodel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ loggedIn: false });
    }

    // 🔥 FULL USER OBJECT (IMPORTANT)
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ loggedIn: false });
  }
};

export default authMiddleware;
