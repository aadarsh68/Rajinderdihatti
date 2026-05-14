import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { sendOtpEmail } from '../../lib/mailer';

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const body = await request.json();
  const { email } = body || {};

  if (!email) {
    return buildError('Email is required.');
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return buildError('Invalid email address.');
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return buildError('User not found.', 404);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return NextResponse.json({ 
      success: true,
      message: 'OTP sent to your email. Check your inbox.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return buildError('Unable to process request. Please try again later.', 500);
  }
}
