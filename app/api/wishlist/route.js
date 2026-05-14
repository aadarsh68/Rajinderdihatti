import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ items: [] });

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    return NextResponse.json({
      items: items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        code: i.product.code,
        bg: i.product.colorHex,
        color: i.product.color,
      })),
    });
  } catch (error) {
    console.error('GET /api/wishlist error:', error);
    return buildError('Failed to fetch wishlist', 500);
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return buildError('Unauthorized', 401);

    const { items } = await request.json();

    // Clear existing wishlist and replace with new items
    await prisma.wishlistItem.deleteMany({
      where: { userId: session.user.id },
    });

    if (items && items.length > 0) {
      await prisma.wishlistItem.createMany({
        data: items.map(item => ({
          userId: session.user.id,
          productId: item.id,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/wishlist error:', error);
    return buildError('Failed to update wishlist', 500);
  }
}
