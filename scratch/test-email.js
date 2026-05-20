const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env' });

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);
  console.log('User:', process.env.EMAIL_USER);
  console.log('Secure:', process.env.EMAIL_SECURE);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection successful!');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'SMTP Test - Rajinder Di Hatti',
      text: 'If you see this, your SMTP settings are correct.',
    });
    console.log('Test email sent successfully!', info.messageId);
  } catch (error) {
    console.error('SMTP Error:', error.message);
    console.error('Error Stack:', error.stack);
  }
}

testEmail();
