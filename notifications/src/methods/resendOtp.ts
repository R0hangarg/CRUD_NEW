import nodemailer from 'nodemailer'
import otpGenerator from 'otp-generator'
import twilio from 'twilio'
import { sendOTP, sendmailOTP } from './sendOtp';

//ReSend OTP method common for both contact ( phone / email )
export const resendOTP = async (contact: any, contactType: any) => {
    if (contactType === 'phone') {
        const mailOtp = await sendOTP(contact); // contact is the phone number
        return mailOtp

    } else if (contactType === 'email') {
        const mailOtp = await sendmailOTP(contact); // contact is the email
        return mailOtp

    }
    console.log('OTP resend request processed');
};