'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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

    let attempts = 0;

    const confirmWithRetry = async () => {
      try {
        const res = await fetch(
          `/api/payment/verify?reference=${reference}`
        );
        const data = await res.json();

        if (res.ok && data.status === 'success') {
          setStatus('success');
          router.replace(`/dashboard/orders/${data.reference}`);
          return;
        }

        throw new Error('Not confirmed yet');
      } catch {
        attempts++;

        if (attempts < 5) {
          setTimeout(confirmWithRetry, 3000); // retry every 3s
        } else {
          setError(
            'Payment received. Order confirmation may take a moment. Please check your orders shortly.'
          );
          setStatus('failed');
        }
      }
    };

    

    confirmWithRetry();

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
