import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { randomBytes, scryptSync } from 'crypto';
import { sendOtpEmail } from '../../lib/mailer';

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
  const { firstName, lastName, email, phone, password } = body || {};

  if (!firstName || !lastName || !email || !phone || !password) {
    return buildError('All fields are required.');
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return buildError('Invalid email address.');
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return buildError('Invalid phone number.');
  }

  if (password.length < 8) {
    return buildError('Password must be at least 8 characters.');
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return buildError('This email is already registered.', 409);
    }

    const hashedPassword = hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName.trim()} ${lastName.trim()}`,
        phone,
        otp,
        otpExpiry,
      },
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return buildError('Unable to register user. Please try again later.', 500);
  }
}
