import client from "../redis/redisClient";
import { Request, Response } from "express";
import { sendmailOTP, sendOTP } from "../methods/sendOtp";
import { resendOTP } from "../methods/resendOtp";
require('dotenv').config()

//ReSend OTP to login
export const resendOtpToLogin = async (req: Request, res: Response) => {
    try {
        const user = req.body; // contact can be phone or email
        if (user.contactType !== 'phone' && user.contactType !== 'email') {
            return res.status(400).json({
                status: false,
                message: 'Invalid contact type',
                data: null,
                error: 'Invalid contact type'
            });
        }
        let mailotp;
        let db;

        if (user.contactType === 'email') {
            mailotp = await resendOTP(user.email, user.contactType);
            if (!mailotp) {
                return res.status(500).json({
                    status: false,
                    message: 'Failed to generate OTP',
                    data: null,
                    error: 'Failed to generate OTP'
                });
            }

        } else {
            mailotp = await resendOTP(user.contact, user.contactType);
            if (!mailotp) {
                return res.status(500).json({
                    status: false,
                    message: 'Failed to generate OTP',
                    data: null,
                    error: 'Failed to generate OTP'
                });
            }
        }
        const cacheKey = `${user.contact}`;
        await client.set(cacheKey, mailotp, { 'EX': 120 });
        res.json({
            status: true,
            message: 'OTP sent',
            data: null,
            error: null
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error sending OTP',
            data: null,
            error: error
        });
    }
};