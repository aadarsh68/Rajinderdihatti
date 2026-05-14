  import { NextResponse } from 'next/server';
  import { prisma } from '../../lib/prisma';
  import { scryptSync } from 'crypto';
  import { cookies } from 'next/headers';

  function buildError(message, status = 400) {
    return NextResponse.json({ error: message }, { status });
  }

  function verifyPassword(storedPassword, submittedPassword) {
    if (!storedPassword || !submittedPassword) return false;
    const [salt, hash] = storedPassword.split(':');
    if (!salt || !hash) return false;
    const derived = scryptSync(submittedPassword, salt, 64).toString('hex');
    return derived === hash;
  }

  export async function POST(request) {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return buildError('Email and password are required.');
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return buildError('Invalid email address.');
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return buildError('Invalid email or password.', 401);
      }

      if (!verifyPassword(user.password, password)) {
        return buildError('Invalid email or password.', 401);
      }

      // Set session cookie
      const cookieStore = cookies();
      cookieStore.set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Login error:', error);
      return buildError('Unable to sign in. Please try again later.', 500);
    }
  }
