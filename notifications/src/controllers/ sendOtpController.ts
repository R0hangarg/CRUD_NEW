import client from "../redis/redisClient";
import { Request, Response } from "express";
import { sendmailOTP, sendOTP } from "../methods/sendOtp";
import { producerRun } from "../Kafka/producer";
require('dotenv').config()


//Send OTP to login
export const sendOtpToLogin = async (req:any) => {
    try {
        
        let mailotp;

        if (req.contactType === 'email') {
            mailotp = await sendmailOTP(req.contact);
            if (!mailotp) {
                producerRun({
                    status: false,
                    message: 'Failed to generate OTP',
                    data: null,
                    error: 'Failed to generate OTP'
                })

               return console.log("failed to create OTP")
                // return res.status(500).json({
                //     status: false,
                //     message: 'Failed to generate OTP',
                //     data: null,
                //     error: 'Failed to generate OTP'
                // });
            }

        } else {
            mailotp = await sendOTP(req.contact);
            if (!mailotp) {
                producerRun({
                    status: false,
                    message: 'Failed to generate OTP',
                    data: null,
                    error: 'Failed to generate OTP'
                })
                return console.log("failed to create OTP")

                // return res.status(500).json({
                //     status: false,
                //     message: 'Failed to generate OTP',
                //     data: null,
                //     error: 'Failed to generate OTP'
                // });
            }
        }
console.log("BEFORE STORING IN REDIS ")
        const cacheKey = `${req.contact}`;
        await client.set(cacheKey, mailotp, { 'EX': 120 }); // 1 hour expiration
console.log("AFTER STORING IN REDIS ")
        
        console.log("Otp sent")
        producerRun({
            status: true,
            message: 'OTP sent success',
            data: null,
            error: null
        })
        // res.json({
        //     status: true,
        //     message: 'OTP sent',
        //     data: null,
        //     error: null
        // });
    } catch (error) {
        console.log("error sending Otp")
        producerRun({
            status: false,
            message: 'Error sending OTP from NOTIFI',
            data: null,
            error: error
        })
        // res.status(500).json({
        //     status: false,
        //     message: 'Error sending OTP',
        //     data: null,
        //     error: error
        // });
    }
};

