import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';

export async function POST(request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers.get('x-razorpay-signature');

    if (!secret) {
      console.error('Razorpay webhook secret is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature header' }, { status: 400 });
    }

    const body = await request.text();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { payload } = event;
    const razorpayOrderId = payload.order?.entity?.id || payload.payment?.entity?.order_id;
    const paymentId = payload.payment?.entity?.id;

    if (!razorpayOrderId) {
      console.warn('Razorpay webhook received without order id', event);
      return NextResponse.json({ status: 'ignored', message: 'No order id found' });
    }

    const order = await prisma.order.findFirst({ where: { razorpayOrderId } });

    if (!order) {
      console.warn(`Razorpay webhook received for unknown order ${razorpayOrderId}`);
      return NextResponse.json({ status: 'ignored', message: 'Order not found' });
    }

    const eventType = event.event;
    const orderUpdate = {};

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      orderUpdate.status = 'paid';
      if (paymentId) {
        orderUpdate.paymentId = paymentId;
      }
    } else if (eventType === 'payment.failed' || eventType === 'order.failed') {
      orderUpdate.status = 'failed';
    }

    if (Object.keys(orderUpdate).length > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: orderUpdate,
      });
      console.log(`Razorpay webhook: updated order ${order.id} to ${orderUpdate.status || order.status}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
