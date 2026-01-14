import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

const db = getAdminDb();

export async function POST(req: Request) {

  console.log('🔥 WEBHOOK HIT');

  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const signature = req.headers.get('x-paystack-signature');

  // 🔎 Log signature header
  console.log('🔑 Paystack Signature Header:', signature);

  const body = await req.text();

  // 1️⃣ Verify Paystack signature
  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  // 🔎 Log computed hash
  console.log('🧮 Computed Hash:', hash);

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log('✅ SIGNATURE VERIFIED');

  const event = JSON.parse(body);

  // 2️⃣ Only act on successful charges
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const reference = data.reference;

  console.log('📦 Payment Reference:', reference);

  try {
    const orderRef = db.collection('orders').doc(reference);
    const existing = await orderRef.get();

    // 3️⃣ Idempotency (Paystack retries)
    if (!existing.exists) {
      console.error('Order not found for reference:', reference);
      return NextResponse.json({ received: true });
    }
    
    // ✅ Correct idempotency check
    if (existing.data()?.status === 'PAID') {
      return NextResponse.json({ received: true });
    }
    const metadata =
      typeof data.metadata === 'string' ? {} : data.metadata;

    // 4️⃣ Create order (SERVER-SIDE ONLY)
    await orderRef.update({
        status: 'PAID',
        paymentReference: reference,
        updatedAt: FieldValue.serverTimestamp(),
    });
      
    console.log('🎉 ORDER MARKED PAID:', reference);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ received: true });
  }
}
