import express from 'express'
import { logOutUser, loginUser, registerUser } from '../controllers/userController';
import { resendOtpToLogin, sendOtpToLogin, verifyOtpToLogin } from '../controllers/notificationController';

const userRouter = express.Router();

userRouter.post('/auth/register',registerUser);
userRouter.post('/auth/login',loginUser);
userRouter.post('/auth/login/send-otp',sendOtpToLogin);
userRouter.post('/auth/login/verify-otp',verifyOtpToLogin);
userRouter.post('/auth/login/resend-otp',resendOtpToLogin);
userRouter.post('/logout', logOutUser);

export default userRouter;