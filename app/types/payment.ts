// app/types/payment.ts

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getHeaders() {
  const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not set');
  }

  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  };
}

export async function initializePayment(data: {
  email: string;
  amount: number; // in NAIRA
  reference: any;
  metadata?: Record<string, any>;
}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      email: data.email,
      amount: data.amount * 100, // convert to kobo
      metadata: data.metadata,
    }),
  });

  const result = await res.json();

  if (!res.ok || !result.status) {
    throw new Error(result.message || 'Paystack initialization failed');
  }

  return result.data as {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
}

export async function verifyPayment(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: getHeaders(),
    }
  );

  const result = await res.json();

  if (!res.ok || !result.status) {
    throw new Error(result.message || 'Paystack verification failed');
  }

  return result.data as {
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata?: Record<string, any>;
  };
}
