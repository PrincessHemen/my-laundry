'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Order, ClothingItem } from '@/app/types/order';
import Header from '@/app/components/layout/Header';
import ProtectedRoute from '@/app/components/ProtectedRoutes';

const OrderDetailsPage = () => {

  useEffect(() => {
    document.title = "My Order | MyLaundry";
  }, [])

  const router = useRouter();
  const params = useParams();
  const { orderID } = params as { orderID: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order by ID
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?orderId=${orderID}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to fetch order');
          setOrder(null);
        } else {
          // The API should return { order: Order }
          setOrder(data.order);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderID]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <Header />

        <main className="max-w-5xl mx-auto w-full px-6 py-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-cyan-300 underline mb-6"
          >
            ← Back to Dashboard
          </button>

          {loading && <p>Loading order details...</p>}

          {error && <p className="text-red-400">{error}</p>}

          {order && (
            <div className="bg-blue-900/50 p-6 rounded-lg border border-cyan-500/40">
              <h1 className="text-2xl font-semibold mb-4 cursor-pointer text-cyan-300"
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                Order ID: {order.id}
              </h1>

              <p className="mb-2"><span className="font-semibold">Status:</span> {order.status}</p>
              <p className="mb-2"><span className="font-semibold">Pickup Date:</span> {order.pickupDate}</p>
              <p className="mb-2"><span className="font-semibold">Pickup Address:</span> {order.pickupAddress}</p>
              <p className="mb-2"><span className="font-semibold">Dropoff Address:</span> {order.dropoffAddress}</p>
              <p className="mb-4"><span className="font-semibold">Total Amount:</span> ₦{order.totalAmount.toLocaleString()}</p>

              <h2 className="text-xl font-semibold mb-2">Items:</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-cyan-500/40">
                    <th className="text-left py-2 px-2">Item</th>
                    <th className="text-left py-2 px-2">Quantity</th>
                    <th className="text-left py-2 px-2">Price per Unit</th>
                    <th className="text-left py-2 px-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: ClothingItem, idx: number) => (
                    <tr key={idx} className="border-b border-cyan-500/20">
                      <td className="py-2 px-2">{item.type}</td>
                      <td className="py-2 px-2">{item.quantity}</td>
                      <td className="py-2 px-2">₦{item.pricePerUnit.toLocaleString()}</td>
                      <td className="py-2 px-2">₦{(item.quantity * item.pricePerUnit).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {order.paymentReference && (
                <p className="mt-4"><span className="font-semibold">Payment Reference:</span> {order.paymentReference}</p>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default OrderDetailsPage;
