import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    let where = {};
    
    if (category) {
      if (category === 'sale') {
        where.OR = [
          { category: { equals: 'sale', mode: 'insensitive' } },
          { status: { equals: 'sale', mode: 'insensitive' } }
        ];
      } else {
        where.status = { in: ['active', 'sale'] };
        where.category = { equals: category, mode: 'insensitive' };
      }
    } else {
      where.status = { in: ['active', 'sale'] };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
