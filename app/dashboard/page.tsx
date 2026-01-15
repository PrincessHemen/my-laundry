
'use client'

// app/dashboard/page.tsx

// List all a particular customer's orders and their current state 

import ProtectedRoute from '../components/ProtectedRoutes';
import Header from '../components/layout/Header';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/app/types/order';


const DashboardPage = () => {

  useEffect(() => {
    document.title = "Dashboard | MyLaundry";
  }, [])

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Fetch orders when user is available
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/orders?userId=${user.uid}`);
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders);
        } else {
          console.error('Error fetching orders:', data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);


  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        
        <Header />

        <main className="max-w-5xl mx-auto w-full px-6 py-10">
          
          {/* Welcome */}
          {user && (
            <h1 className="text-2xl font-semibold mb-6">
              Welcome, {user.displayName || user.email} 👋
            </h1>
          )}

          {/* Book New Laundry Button */}
          <button
            onClick={() => router.push('/dashboard/new-order')}
            className="bg-cyan-500 hover:bg-cyan-600 text-blue-950 font-semibold px-6 py-3 rounded-md mb-8 transition hover:cursor-pointer"
          >
            Book New Laundry
          </button>

          {/* Orders List */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Orders</h2>

            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>You have no orders yet.</p>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-blue-900/50 border border-cyan-500/40 rounded-lg p-4 flex justify-between items-center hover:shadow-lg transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    <div>
                      <p className="font-semibold">Order ID: {order.id}</p>
                      <p>Pickup Date: {order.pickupDate}</p>
                      <p>Status: {order.status}</p>
                      <p>Total: ₦{(order.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="text-cyan-300 underline">View Details</div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      
      </div>
    </ProtectedRoute> 
  );
};

export default DashboardPage; 