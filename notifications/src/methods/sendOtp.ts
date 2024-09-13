import nodemailer from 'nodemailer'
import otpGenerator from 'otp-generator'
import twilio from 'twilio'
require('dotenv').config()

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
export const sendmailOTP = async (email: string) => {
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
export const sendOTP = async (phone: number) => {
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
