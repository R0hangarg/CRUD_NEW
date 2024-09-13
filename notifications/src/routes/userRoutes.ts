import express from 'express'
import { sendOtpToLogin } from '../controllers/ sendOtpController';
import { verifyOtpToLogin } from '../controllers/verifyOtpController';
import { resendOtpToLogin } from '../controllers/resendOtpController';

const userRouter = express.Router();

userRouter.get('/auth/login/send-otp',sendOtpToLogin);
userRouter.get('/auth/login/verify-otp',verifyOtpToLogin);
userRouter.get('/auth/login/resend-otp',resendOtpToLogin);

export default userRouter;
