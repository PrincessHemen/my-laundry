export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebaseAdmin';
import { Order, ClothingItem } from '@/app/types/order';
import { v4 as uuidv4 } from 'uuid';

// Helper: validate required fields
function validateOrderBody(body: any): { valid: boolean; message?: string } {
  const requiredFields = [
    'userId',
    'customerName',
    'customerEmail',
    'pickupAddress',
    'dropoffAddress',
    'pickupDate',
    'dropoffDate',
    'items',
    'totalAmount'
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return { valid: false, message: `Missing field: ${field}` };
    }
  }

  // Simple check for items array
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { valid: false, message: 'Items array must not be empty' };
  }

  return { valid: true };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId'); 

    // Fetch single order by ID
    if (orderId) {
        const doc = await adminDb.collection('orders').doc(orderId).get();
        if (!doc.exists) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        const order: Order = {
          id: doc.id,
          ...(doc.data() as Omit<Order, 'id'>)
        };
        return NextResponse.json({ order });
    }

    // Fetch all orders for a user
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const orders: Order[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Order, 'id'>)
    }));

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const { valid, message } = validateOrderBody(body);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const newOrder: Order = {
      id: uuidv4(), // generate a unique ID
      userId: body.userId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      pickupAddress: body.pickupAddress,
      dropoffAddress: body.dropoffAddress,
      pickupDate: body.pickupDate,
      dropoffDate: body.dropoffDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: body.items as ClothingItem[],
      totalAmount: body.totalAmount,
      status: 'PAID', // assuming full payment upfront via Paystack
      paymentReference: body.paymentReference || null
    };

    // Save to Firestore
    await adminDb.collection('orders').doc(newOrder.id).set(newOrder);

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
