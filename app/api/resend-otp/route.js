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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP resend error:', error);
    return buildError('Unable to resend OTP. Please try again later.', 500);
  }
}