import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { randomBytes, scryptSync } from 'crypto';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const body = await request.json();
  const { email, otp, newPassword } = body || {};

  if (!email || !otp || !newPassword) {
    return buildError('Email, OTP, and new password are required.');
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return buildError('Invalid email address.');
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return buildError('Invalid OTP format.');
  }

  if (newPassword.length < 8) {
    return buildError('Password must be at least 8 characters.');
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

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password and clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return buildError('Unable to reset password. Please try again later.', 500);
  }
}
