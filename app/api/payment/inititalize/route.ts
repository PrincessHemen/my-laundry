// app/api/payment/initialize/route.ts
import { NextResponse } from 'next/server';
import { initializePayment } from '@/app/types/payment';
import { adminAuth } from '@/app/lib/firebaseAdmin';


export async function POST(req: Request) {
  try {
    /* ------------------ AUTH ------------------ */
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];

    const decodedUser = await adminAuth.verifyIdToken(idToken);

    if (!decodedUser.email) {
      return NextResponse.json(
        { error: 'User email not available' },
        { status: 400 }
      );
    }

    /* ------------------ BODY ------------------ */
    const body = await req.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    /* ---------------- PAYSTACK ---------------- */
    const payment = await initializePayment({
      email: decodedUser.email,
      amount,
      metadata: {
        userId: decodedUser.uid,
      },
    });

    return NextResponse.json({
      authorizationUrl: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (err: any) {
    console.error('Paystack init error:', err);

    return NextResponse.json(
      { error: err.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
