import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const body = await request.json();
  const { email, otp } = body || {};

  if (!email || !otp) {
    return buildError('Email and OTP are required.');
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return buildError('Invalid email address.');
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return buildError('Invalid OTP format.');
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return buildError('User not found.', 404);
    }

    if (!user.otp || user.otp !== otp) {
      return buildError('Invalid OTP.');
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return buildError('OTP has expired.');
    }

    // Clear OTP on successful verification
    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP verification error:', error);
    return buildError('Unable to verify OTP. Please try again later.', 500);
  }
}