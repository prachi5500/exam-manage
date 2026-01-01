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

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};