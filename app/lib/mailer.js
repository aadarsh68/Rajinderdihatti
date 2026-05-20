import nodemailer from 'nodemailer';

const emailHost = process.env.EMAIL_HOST;
const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || 'mrigaanktextiles@gmail.com';

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
    subject: 'Your Rajinder Di Hatti OTP Code',
    text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: serif; color: #3a2e1e; padding: 20px; background: #faf5ec; border: 1px solid #c9982a;">
        <h2 style="color: #c9982a; letter-spacing: 2px;">RAJINDER DI HATTI</h2>
        <p style="font-size: 16px;">Your verification code is: <strong style="font-size: 24px; color: #3a2e1e;">${otp}</strong></p>
        <p style="font-size: 12px; color: #9a8060;">This code is valid for 10 minutes. Please do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid rgba(201,152,42,0.2); margin: 20px 0;">
        <p style="font-size: 10px; color: #b0a080;">© 2026 Rajinder Di Hatti. Luxury Indian Ethnic Wear.</p>
      </div>
    `,
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
