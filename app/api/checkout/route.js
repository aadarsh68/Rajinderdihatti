import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';

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
    const { 
      shippingAddress, phone, email, paymentMethod, delivery = 'standard', couponCode
    } = body || {};

    if (!shippingAddress || !phone) {
      return buildError('Shipping address and phone number are required.');
    }

    // Get user's cart items with latest product prices
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return buildError('Cart is empty.', 400);
    }

    // Calculate Subtotal from DB prices
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // Calculate coupon discount
    let discount = 0;
    if (couponCode) {
      const codeUpper = couponCode.trim().toUpperCase();
      if (codeUpper === 'WELCOME200') {
        const orderCount = await prisma.order.count({
          where: { userId }
        });
        if (orderCount > 0) {
          return buildError('This coupon is only valid for new users on their first order.');
        }
        discount = Math.min(subtotal, 200);
      } else {
        return buildError('Invalid coupon code.');
      }
    }
    
    // Calculate Shipping (Standard: 149, Free above 5000 | Express: 299)
    let shippingPrice = 0;
    if (delivery === 'express') {
      shippingPrice = 299;
    } else {
      shippingPrice = subtotal > 5000 ? 0 : 149;
    }

    // Calculate Handling Fee (COD: 50)
    const handlingFee = paymentMethod === 'cod' ? 50 : 0;
    
    const total = subtotal - discount + shippingPrice + handlingFee;

    // Prepare order items
    const orderItemsData = cartItems.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        shippingAddress,
        phone,
        email,
        paymentMethod,
        shippingPrice,
        handlingFee,
        discount,
        couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return buildError('Failed to complete checkout', 500);
  }
}
