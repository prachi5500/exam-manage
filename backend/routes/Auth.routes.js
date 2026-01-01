import express from 'express';
import {
    Register,
    VerifyEmail,
    Login,
    ForgotPassword,
    VerifyResetOTP,
    ResetPassword,
    Logout,
    checkLogin
} from '../controllers/Auth.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const AuthRoutes = express.Router();

AuthRoutes.get('/check-login', authMiddleware, checkLogin);
AuthRoutes.post('/register', Register);           // ← Now matches
AuthRoutes.post('/verifyEmail', VerifyEmail);     // ← Now matches
AuthRoutes.post('/login', Login);
AuthRoutes.post('/forgot-password', ForgotPassword);
AuthRoutes.post('/verify-reset-otp', VerifyResetOTP);
AuthRoutes.post('/reset-password', ResetPassword);
AuthRoutes.post('/logout', Logout);

export default AuthRoutes;