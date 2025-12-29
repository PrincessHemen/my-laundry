import { NextResponse } from 'next/server';
import { verifyPayment } from '@/app/types/payment';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing reference' },
        { status: 400 }
      );
    }

    const payment = await verifyPayment(reference);

    return NextResponse.json({
      status: payment.status,
      reference: payment.reference,
      amount: payment.amount,
      email: payment.customer.email,
      metadata: payment.metadata ?? null,
    });
  } catch (err: any) {
    console.error('Paystack verify error:', err);

    return NextResponse.json(
      { error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
