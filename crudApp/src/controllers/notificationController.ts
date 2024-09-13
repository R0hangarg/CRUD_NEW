import nodemailer from 'nodemailer'
import twilio from 'twilio'
import client from "../redis/redisClient";
import User from "../models/userModel";
import { Request, Response } from "express";
import { run } from '../kafka/producer';
import { Kafka } from 'kafkajs';


const generateOTP = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        otp += chars[randomIndex];
    }

    return otp;
}



// Method to login by EMAIL and OTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Replace with your SMTP server host
    port: 587, // Replace with the port your SMTP server uses
    secure: false, // Use true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // Replace with your email address
        pass: process.env.SMTP_PASS // Replace with your email password
    }
});
const sendmailOTP = async (email: string) => {
    const otp = generateOTP();
    const mailOptions = {
        from: `"JohnDoe" ${process.env.SMTP_USER} `, // Sender address
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error occurred:', error);
            }
            console.log('Message sent:', info.messageId);
        });
        console.log('OTP sent successfully');
        return otp;
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
};

// Method to login by PHONE and OTP
const clientTwilio = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const sendOTP = async (phone: number) => {
    const otp = generateOTP();

    try {
        await clientTwilio.messages.create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `${phone}`
        });
        console.log('OTP sent successfully');
        return otp;
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
};


//ReSend OTP method common for both contact ( phone / email )
const resendOTP = async (contact: any, contactType: any) => {
    if (contactType === 'phone') {
        const mailOtp = await sendOTP(contact); // contact is the phone number
        return mailOtp

    } else if (contactType === 'email') {
        const mailOtp = await sendmailOTP(contact); // contact is the email
        return mailOtp

    }
    console.log('OTP resend request processed');
};

//Send OTP to login
export const sendOtpToLogin = async (req: Request, res: Response) => {
    try {
        const user = req.body; // contact can be phone or email
        let db;

        if (user.contactType !== 'phone' && user.contactType !== 'email') {
            return res.status(400).json({
                status: false,
                message: 'Invalid contact type',
                data: null,
                error: 'Invalid contact type'
            });
        }

        if (user.contactType === 'email') {
            db = await User.findOne({ email: user.contact });
            if (!db) {
                return res.status(404).json({
                    status: false,
                    message: 'Register First',
                    data: null,
                    error: 'User not found'
                });
            }
        } else {
            db = await User.findOne({ phone: user.contact });
            if (!db) {
                return res.status(404).json({
                    status: false,
                    message: 'Register First',
                    data: null,
                    error: 'User not found'
                });
            }
        }
console.log("Before running producer in Crud APP")
        await run(user);
        console.log("After running producer in Crud APP")

        const kafka = new Kafka({
            clientId: 'Crud_Consumer',
            brokers: ['kafka:9092']
        });

        const consumer = await kafka.consumer({ groupId: 'test-233233' });

        await consumer.connect();
        console.log('Consumer connected');

        await consumer.subscribe({ topic: 'RESPONSE_TOPICs', fromBeginning: false });
        console.log('Consumer running');

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message: ${message.value?.toString()} ,${topic} ${partition}`);
                const messageValue = message.value?.toString();
                let parsedMessage
                if (messageValue) {
                    parsedMessage = JSON.parse(messageValue);
                }
                console.log(parsedMessage)
                res.send(parsedMessage)
                await consumer.disconnect();
            }
        });
        console.log('Consumer running done');

        await consumer.disconnect();
        console.log('Consumer is disconnected');



      
        // if (user.contactType !== 'phone' && user.contactType !== 'email') {
        //     return res.status(400).json({
        //         status: false,
        //         message: 'Invalid contact type',
        //         data: null,
        //         error: 'Invalid contact type'
        //     });
        // }

        // let mailotp;
        // let db;

        // if (user.contactType === 'email') {
        //     db = await User.findOne({ email: user.contact });
        //     if (!db) {
        //         return res.status(404).json({
        //             status: false,
        //             message: 'Register First',
        //             data: null,
        //             error: 'User not found'
        //         });
        //     }

        //     mailotp = await sendmailOTP(user.contact);
        //     if (!mailotp) {
        //         return res.status(500).json({
        //             status: false,
        //             message: 'Failed to generate OTP',
        //             data: null,
        //             error: 'Failed to generate OTP'
        //         });
        //     }

        // } else {
        //     db = await User.findOne({ phone: user.contact });
        //     if (!db) {
        //         return res.status(404).json({
        //             status: false,
        //             message: 'Register First',
        //             data: null,
        //             error: 'User not found'
        //         });
        //     }

        //     mailotp = await sendOTP(user.contact);
        //     if (!mailotp) {
        //         return res.status(500).json({
        //             status: false,
        //             message: 'Failed to generate OTP',
        //             data: null,
        //             error: 'Failed to generate OTP'
        //         });
        //     }
        // }

        // const cacheKey = `${user.contact}`;
        // await client.set(cacheKey, mailotp, { 'EX': 120 }); // 1 hour expiration
        // res.json({
        //     status: true,
        //     message: 'OTP sent',
        //     data: null,
        //     error: null
        // });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error sending OTP from CRUD_APP',
            data: null,
            error: error
        });
    }
};

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
            db = await User.findOne({ email: user.contact });
            if (!db) {
                return res.status(404).json({
                    status: false,
                    message: 'Register First',
                    data: null,
                    error: 'User not found'
                });
            }

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
            db = await User.findOne({ phone: user.contact });
            if (!db) {
                return res.status(404).json({
                    status: false,
                    message: 'Register First',
                    data: null,
                    error: 'User not found'
                });
            }
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

let res: Response

export const errorMethod = async (er: any) => {
    console.log(er)
    return res.send(er)
}