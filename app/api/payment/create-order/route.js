import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '../../../lib/prisma';

export async function POST(request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'rzp_test_your_key_id' || keySecret === 'your_secret_here') {
      console.error('Razorpay credentials are not configured in environment variables or are set to default placeholder values.');
      return NextResponse.json(
        { error: 'Razorpay payment gateway is not configured on the server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { orderId } = await request.json();

    // Fetch order from DB to get the actual total (Security: never trust amount from client)
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const options = {
      amount: Math.round(order.total * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log('Razorpay Order Created:', razorpayOrder.id);

    return NextResponse.json({ id: razorpayOrder.id, amount: razorpayOrder.amount });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    // Return specific error message if available
    const errorMsg = error.description || error.message || 'Failed to create Razorpay order';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}