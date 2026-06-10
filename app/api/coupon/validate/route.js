import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return buildError('Unauthorized: Please log in first', 401);
    }

    const body = await request.json();
    const { couponCode } = body || {};

    if (!couponCode) {
      return buildError('Coupon code is required.');
    }

    const codeUpper = couponCode.trim().toUpperCase();

    if (codeUpper === 'WELCOME200') {
      // Check if user has any existing orders
      const orderCount = await prisma.order.count({
        where: { userId }
      });

      if (orderCount > 0) {
        return buildError('This coupon is only valid for new users on their first order.');
      }

      return NextResponse.json({
        success: true,
        valid: true,
        discount: 200,
        message: 'Welcome offer coupon applied!'
      });
    }

    if (codeUpper === 'TEST1' || codeUpper === 'RZP1') {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const shipping = subtotal > 5000 ? 0 : 149;
      const discount = Math.max(0, subtotal + shipping - 1);

      return NextResponse.json({
        success: true,
        valid: true,
        discount,
        message: 'Razorpay Test Coupon applied! Total is now ₹1.'
      });
    }

    return buildError('Invalid coupon code.');
  } catch (error) {
    console.error('Coupon validation error:', error);
    return buildError('Failed to validate coupon', 500);
  }
}
