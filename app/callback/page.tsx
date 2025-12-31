'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase';

// 1️⃣ Move the component that uses useSearchParams into a separate component
function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) {
      setError('Missing payment reference');
      setStatus('failed');
      return;
    }

    const verifyAndCreateOrder = async () => {
      try {
        // Verify payment
        const verifyRes = await fetch(`/api/payments/verify?reference=${reference}`);
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');
        if (verifyData.status !== 'success') throw new Error('Payment not successful');

        // Prepare order data
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('User not logged in');

        const orderBody = {
          userId: currentUser.uid,
          customerName: currentUser.displayName || 'Unknown',
          customerEmail: currentUser.email!,
          pickupAddress: localStorage.getItem('pickupAddress'),
          dropoffAddress: localStorage.getItem('dropoffAddress'),
          pickupDate: localStorage.getItem('pickupDate'),
          dropoffDate: localStorage.getItem('dropoffDate'), 
          items: JSON.parse(localStorage.getItem('orderItems') || '[]'),
          totalAmount: verifyData.amount / 100,
          paymentReference: reference,
        };

        // POST to /api/orders
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderBody),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

        // Redirect to order detail
        router.replace(`/orders/${orderData.order.id}`);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
        setStatus('failed');
      }
    };

    verifyAndCreateOrder();
  }, [searchParams, router]);

  if (status === 'loading') return <p>Processing payment...</p>;
  if (status === 'failed') return <p className="text-red-500">Error: {error}</p>;

  return null;
}

// 2️⃣ Wrap it in Suspense in the default export
export default function OrderCallbackPage() {
  return (
    <Suspense fallback={<div>Loading payment details...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
