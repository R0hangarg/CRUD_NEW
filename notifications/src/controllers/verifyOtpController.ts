import client from "../redis/redisClient";
import { Request, Response } from "express";
import { sendmailOTP, sendOTP } from "../methods/sendOtp";
require('dotenv').config()

//Verify OTP to login
export const verifyOtpToLogin = async (req: Request, res: Response) => {
    try {

        const user = req.body;

        const cacheKey = `${user.contact}`;

        const storedOTP = await client.get(cacheKey);

        if (storedOTP === null) {
            // OTP not found or expired
            console.log('OTP not found or expired');
            return res.json({
                status: false,
                message: "OTP not found or expired",
                data: null,
                error: null
            });
        }

        if (storedOTP === user.inputOtp) {
            // OTP matches
            console.log('OTP verified successfully');
            client.unlink(cacheKey)
            return res.status(200).json({
                status: true,
                message: "OTP verified",
                data: null,
                error: null,
                redirectUrl: '/products'
            })
        } else {
            // OTP does not match
            console.log('Invalid OTP');
            return res.status(500).json({
                status: false,
                message: "Invalid OTP",
                data: null,
                error: null
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error sending otp",
            data: null,
            error: error
        });
    }

}