'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClothingItem } from '@/app/types/order';
import { auth } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/ProtectedRoutes';

export default function NewOrderPage() {

  useEffect(() => {
    document.title = "New Orders | MyLaundry";
  }, [])

  useEffect(() => {
    // User came back from Paystack or refreshed the page
    setLoading(false);
  }, []);

  const router = useRouter();

  // Order state
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Date helpers
  const today = new Date();
  const twoWeeksFromToday = new Date();
  twoWeeksFromToday.setDate(today.getDate() + 14);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Calculate the minimum allowed dropoff (3 days after today)
  const dropoffMinDate = pickupDate
    ? formatDate(new Date(new Date(pickupDate).setDate(new Date(pickupDate).getDate() + 3)))
    : formatDate(today);

  // Calculate the maximum allowed dropoff (14 days after pickup)
  const dropoffMaxDate = pickupDate
    ? formatDate(new Date(new Date(pickupDate).setDate(new Date(pickupDate).getDate() + 14)))
    : formatDate(twoWeeksFromToday);

  // Item management
  const addItem = () => setItems([...items, { type: 'shirt', quantity: 1, pricePerUnit: 500 }]);
  const updateItem = (index: number, field: keyof ClothingItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  // Submit
  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert('Please log in');
      return;
    }
  
    const token = await auth.currentUser.getIdToken();

    if (!pickupAddress || !dropoffAddress || !pickupDate || !dropoffDate || items.length === 0) {
      alert('Please fill all fields and add at least one item');
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
  
    setLoading(true);
  
    const res = await fetch('/api/payment/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: totalAmount,
        pickupAddress,
        dropoffAddress,
        pickupDate,
        dropoffDate,
        items,
      }),
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      setLoading(false);
      alert(data.error || 'Payment failed');
      return;
    }
  
    window.location.href = data.authorizationUrl;
  };
  

  return (
    <ProtectedRoute>

<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white relative overflow-hidden">

        <main className="max-w-4xl mx-auto w-full px-6 py-10 relative z-10">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold italic uppercase tracking-wider text-cyan-400">
              New Laundry Order
            </h1>
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-sm text-cyan-300 hover:underline hover:cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Logistics Section */}
            <div className="bg-blue-900/50 border border-cyan-500/40 rounded-xl p-6 shadow-xl">
              <h2 className="text-lg font-medium mb-4 text-cyan-200 border-b border-cyan-500/20 pb-2">Logistics</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-blue-200 mb-1">Pickup Address</label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full bg-blue-950/50 border border-cyan-500/30 rounded-md p-2 text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-blue-200 mb-1">Dropoff Address</label>
                  <input
                    type="text"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    className="w-full bg-blue-950/50 border border-cyan-500/30 rounded-md p-2 text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-blue-200 mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full bg-blue-950/50 border border-cyan-500/30 rounded-md p-2 text-white focus:outline-none focus:border-cyan-400 transition"
                      min={formatDate(today)}
                      max={formatDate(twoWeeksFromToday)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-blue-200 mb-1">Dropoff Date</label>
                    <input
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="w-full bg-blue-950/50 border border-cyan-500/30 rounded-md p-2 text-white focus:outline-none focus:border-cyan-400 transition"
                      min={dropoffMinDate}
                      max={dropoffMaxDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-blue-900/50 border border-cyan-500/40 rounded-xl p-6 shadow-xl flex flex-col">
              <h2 className="text-lg font-medium mb-4 text-cyan-200 border-b border-cyan-500/20 pb-2">Your Bag</h2>
              
              <div className="space-y-3 mb-6 flex-grow max-h-[300px] overflow-y-auto pr-2">
                {items.length === 0 && (
                  <p className="text-blue-300 text-sm italic">No items added yet...</p>
                )}
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-blue-950/40 border border-white/10 p-2 rounded-lg group">
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(idx, 'type', e.target.value)}
                      className="bg-transparent text-sm flex-grow focus:outline-none"
                    >
                      <option className="bg-blue-900" value="shirt">Shirt</option>
                      <option className="bg-blue-900" value="trouser">Trouser</option>
                      <option className="bg-blue-900" value="tshirt">T-Shirt</option>
                      <option className="bg-blue-900" value="dress">Dress</option>
                      <option className="bg-blue-900" value="suit">Suit</option>
                      <option className="bg-blue-900" value="jacket">Jacket</option>
                      <option className="bg-blue-900" value="bedsheet">Bedsheet</option>
                      <option className="bg-blue-900" value="towel">Towel</option>
                      <option className="bg-blue-900" value="curtains">Curtains</option>
                    </select>
                    
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-14 bg-blue-950/50 border border-cyan-500/20 rounded p-1 text-center text-sm"
                    />

                    <span className="text-xs text-blue-300">@ ₦{item.pricePerUnit}</span>

                    <button 
                      type="button" 
                      onClick={() => removeItem(idx)} 
                      className="text-red-400 hover:text-red-300 font-bold px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addItem} 
                className="w-full py-2 border border-dashed border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition text-sm mb-4"
              >
                + Add Another Item
              </button>

              <div className="mt-auto border-t border-cyan-500/20 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-blue-100">Total Amount:</span>
                  <span className="text-xl font-bold text-cyan-400">
                    ₦{items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-blue-950 font-bold py-3 rounded-md transition shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Pay & Create Order'}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

    </ProtectedRoute>
  );
}
