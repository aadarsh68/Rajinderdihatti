import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return buildError('Unauthorized', 401);

    const { id } = params;
    const body = await request.json();
    const { status, paymentId, razorpayOrderId, trackingUrl } = body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) return buildError('Order not found', 404);
    if (order.userId !== session.user.id) return buildError('Unauthorized', 403);

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status || order.status,
        paymentId: paymentId || order.paymentId,
        razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
        trackingUrl: trackingUrl !== undefined ? trackingUrl : order.trackingUrl,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('PATCH /api/orders/[id] error:', error);
    return buildError('Failed to update order', 500);
  }
}
