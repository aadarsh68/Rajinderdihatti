import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

function buildError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (session.user.role !== 'ADMIN') return null;
  return session;
}

// PUT /api/admin/products/[id] — update a product
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) return buildError('Unauthorized', 401);

    const { id } = params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return buildError('Product not found', 404);

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

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(costPrice !== undefined && { costPrice: costPrice != null ? Number(costPrice) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(reorderLevel !== undefined && { reorderLevel: Number(reorderLevel) }),
        ...(sku !== undefined && { sku }),
        ...(code !== undefined && { code }),
        ...(category !== undefined && { category }),
        ...(fabric !== undefined && { fabric }),
        ...(color !== undefined && { color }),
        ...(colorHex !== undefined && { colorHex }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('PUT /api/admin/products/[id] error:', error);
    return buildError('Failed to update product', 500);
  }
}

// DELETE /api/admin/products/[id] — delete a product
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) return buildError('Unauthorized', 401);

    const { id } = params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return buildError('Product not found', 404);

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] error:', error);
    return buildError('Failed to delete product', 500);
  }
}
