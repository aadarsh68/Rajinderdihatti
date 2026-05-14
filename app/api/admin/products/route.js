import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (session.user.role !== 'ADMIN') return null;
  return session;
}

// GET /api/admin/products — list all products
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return buildError('Unauthorized', 401);

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return buildError('Failed to fetch products', 500);
  }
}

// POST /api/admin/products — create a new product
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) return buildError('Unauthorized', 401);

    const body = await request.json();
    const {
      name,
      description,
      price,
      costPrice,
      imageUrl,
      stock,
      reorderLevel,
      sku,
      code,
      category,
      fabric,
      color,
      colorHex,
      status,
    } = body;

    if (!name || price == null) {
      return buildError('Name and price are required');
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description ?? null,
        price: Number(price),
        costPrice: costPrice != null ? Number(costPrice) : null,
        imageUrl: imageUrl ?? null,
        stock: stock != null ? Number(stock) : 0,
        reorderLevel: reorderLevel != null ? Number(reorderLevel) : 5,
        sku: sku ?? null,
        code: code ?? null,
        category: category ?? null,
        fabric: fabric ?? null,
        color: color ?? null,
        colorHex: colorHex ?? null,
        status: status ?? 'active',
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return buildError('Failed to create product', 500);
  }
}

// PATCH /api/admin/products — update product
export async function PATCH(request) {
  try {
    const session = await requireAdmin();
    if (!session) return buildError('Unauthorized', 401);

    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return buildError('Product ID is required');

    if (data.price != null) data.price = Number(data.price);
    if (data.stock != null) data.stock = Number(data.stock);
    if (data.costPrice != null) data.costPrice = Number(data.costPrice);
    if (data.reorderLevel != null) data.reorderLevel = Number(data.reorderLevel);

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('PATCH /api/admin/products error:', error);
    return buildError('Failed to update product', 500);
  }
}

// DELETE /api/admin/products — delete product
export async function DELETE(request) {
  try {
    const session = await requireAdmin();
    if (!session) return buildError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return buildError('Product ID is required');

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/products error:', error);
    return buildError('Failed to delete product', 500);
  }
}
