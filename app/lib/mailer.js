import nodemailer from 'nodemailer';

const emailHost = process.env.EMAIL_HOST;
const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || 'no-reply@mrigaanktex.com';

const transportOptions = {
  host: emailHost,
  port: emailPort,
  secure: process.env.EMAIL_SECURE === 'true',
};

if (emailUser && emailPass) {
  transportOptions.auth = { user: emailUser, pass: emailPass };
}

export const transporter = nodemailer.createTransport(transportOptions);

export async function sendOtpEmail(to, otp) {
  if (!emailHost || !emailPort || !emailUser || !emailPass) {
    console.warn('Email env variables are not configured. OTP will be logged to console instead.');
    console.log(`OTP for ${to}: ${otp}`);
    return false;
  }

  const message = {
    from: emailFrom,
    to,
    subject: 'Your Mrigaank Tex OTP Code',
    text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP code is <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    console.log(`OTP for ${to}: ${otp}`);
    return false;
  }
}
