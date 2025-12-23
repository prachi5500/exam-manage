import express from 'express'
import { Reigster, VerfiyEmail ,Login, 
    ForgotPassword, 
    ResetPassword,VerifyResetOTP  } from '../controllers/Auth.js'

const AuthRoutes=express.Router()

AuthRoutes.post('/register',Reigster)
AuthRoutes.post('/verifyEmail',VerfiyEmail)
AuthRoutes.post('/login', Login);
AuthRoutes.post('/forgot-password', ForgotPassword);
AuthRoutes.post('/verify-reset-otp', VerifyResetOTP)
AuthRoutes.post('/reset-password', ResetPassword);

export default AuthRoutes;