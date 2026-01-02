'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase';
import { User } from 'firebase/auth';

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
        const verifyRes = await fetch(`/api/payment/verify?reference=${reference}`);
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');
        if (verifyData.status !== 'success') throw new Error('Payment not successful');

        // Prepare order data
        const currentUser = await new Promise<any>((resolve, reject) => {
          const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
            unsubscribe();
            if (user) resolve(user);
            else reject(new Error('User not logged in'));
          });
        });
        

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
          paymentStatus: verifyData.status,
        };

        // POST to /api/orders
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderBody),
        });

        //const orderData = await orderRes.json();
        // 🔍 LOG THE RAW RESPONSE BEFORE PARSING
        const responseText = await orderRes.text();
        console.log('Raw response from /api/orders:', responseText);
        console.log('Response status:', orderRes.status);
        console.log('Response ok:', orderRes.ok);

        // Now try to parse it
        let orderData;
        try {
          orderData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
        }

        if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

        // Redirect to order detail page
        router.replace(`/dashboard/orders/${orderData.order.id}`);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
        setStatus('failed');
      }
    };

    verifyAndCreateOrder();
  }, [searchParams, router]);

  if (status === 'loading') return <div className="min-h-screen justify-center items-center flex flex-col  bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 relative overflow-hidden">
    <div className="p-8 bg-white shadow-2xl rounded-xl flex flex-col items-center w-80 md:w-96 text-center">
      {/* Animated Spinner */}
      <svg 
        className="animate-spin h-10 w-10 text-[#7231EC] mb-4" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h2>
    <p className="text-gray-600">Please do not refresh the page... <br /> we're finalizing your order ❤</p>
  </div>
</div>

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
