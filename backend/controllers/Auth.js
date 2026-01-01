import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail } from "../middlewares/Email.js"; // Fixed typo
import { generateTokenAndSetCookies } from "../middlewares/GenerateToken.js";
import { Usermodel } from "../models/User.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const checkLogin = async (req, res) => {
  try {
    return res.json({ loggedIn: true, user: req.user });
  } catch (error) {
    return res.status(401).json({ loggedIn: false });
  }
};

export const Register = async (req, res) => { // Fixed typo Reigster
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const existingUser = await Usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists. Please login" });
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new Usermodel({
      email,
      name,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 3600000, // 1 hour
      role: 'user'
    });
    await user.save();
    const token = generateTokenAndSetCookies(res, user); // Capture token
    await sendVerificationEmail(email, verificationToken);
    await sendWelcomeEmail(email, name);
    return res.status(201).json({
      success: true,
      message: "User registered. Verify email.",
      token: token,
      user: { ...user._doc, password: undefined }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const VerifyEmail = async (req, res) => { // Fixed typo VerfiyEmail
  try {
    const { code } = req.body;
    const user = await Usermodel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Email verified successfully", user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Please verify your email first" });
    }
    const isMatch = bcryptjs.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const token = generateTokenAndSetCookies(res, user); // Capture token
    user.lastLogin = Date.now();
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('🔥 Login error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour
    await user.save();
    await sendResetPasswordEmail(email, resetToken);
    return res.status(200).json({ success: true, message: "Password reset code sent to email" });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const VerifyResetOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await Usermodel.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
    }
    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await Usermodel.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
    }
    user.password = bcryptjs.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};