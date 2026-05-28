import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('Razorpay key secret is not configured');
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
    }

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('Razorpay signature verification failed');
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Signature matches, update order in DB to paid
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id }
    });

    if (!order) {
      console.error(`Order not found for Razorpay order ID: ${razorpay_order_id}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        paymentId: razorpay_payment_id
      }
    });

    console.log(`Payment signature verified successfully for order: ${order.id}`);
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Verify payment signature error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
