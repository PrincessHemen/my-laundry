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
  const firestoreOrderId = data.metadata?.orderId;

  if (!firestoreOrderId) {
    console.error('No orderId in metadata');
    return NextResponse.json({ received: true }); // Still return 200 to Paystack
  }

  console.log('📦 Payment Reference:', reference);

  try {
    // ✅ Use the orderId from metadata to find the document
    const orderRef = db.collection('orders').doc(firestoreOrderId);

    await orderRef.set({
        status: 'PAID',
        paymentReference: reference, // Store Paystack's ref for records
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });   
      
    console.log('🎉 ORDER DOCUMENT MARKED PAID:', firestoreOrderId);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ received: true });
  }
}
