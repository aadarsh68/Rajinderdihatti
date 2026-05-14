import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';

export async function POST(request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers.get('x-razorpay-signature');

    const body = await request.text();

    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const { payload } = event;

    // Handle payment.captured or order.paid
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const rzpOrderId = payload.order?.entity?.id || payload.payment?.entity?.order_id;
      const paymentId = payload.payment?.entity?.id;

      if (rzpOrderId) {
        // Find the order with this razorpayOrderId
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: rzpOrderId }
        });

        if (order && order.status !== 'paid') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'paid',
              paymentId: paymentId || order.paymentId
            }
          });
          console.log(`Webhook: Order ${order.id} marked as PAID via ${event.event}`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
