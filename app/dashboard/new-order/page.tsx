'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializePayment } from '@/app/types/payment';
import { ClothingItem } from '@/app/types/order';
import { auth } from '@/app/lib/firebase';

export default function NewOrderPage() {
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

  const dropoffMinDate = pickupDate
    ? formatDate(new Date(new Date(pickupDate).setDate(new Date(pickupDate).getDate() + 3)))
    : formatDate(today);

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

    if (!pickupAddress || !dropoffAddress || !pickupDate || !dropoffDate || items.length === 0) {
      alert('Please fill all fields and add at least one item');
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);

    // Store order info locally for callback
    localStorage.setItem('orderItems', JSON.stringify(items));
    localStorage.setItem('pickupAddress', pickupAddress);
    localStorage.setItem('dropoffAddress', dropoffAddress);
    localStorage.setItem('pickupDate', pickupDate);
    localStorage.setItem('dropoffDate', dropoffDate);

    setLoading(true);
    try {
      const payment = await initializePayment({
        email: auth.currentUser.email!,
        amount: totalAmount,
        metadata: { userId: auth.currentUser.uid },
      });

      window.location.href = payment.authorization_url;
    } catch (err: any) {
      console.error('Payment init error:', err);
      alert(err.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">New Laundry Order</h1>

      {/* Pickup/Dropoff Addresses */}
      <div className="mb-4">
        <label className="block mb-1">Pickup Address</label>
        <input
          type="text"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Dropoff Address</label>
        <input
          type="text"
          value={dropoffAddress}
          onChange={(e) => setDropoffAddress(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Pickup/Dropoff Dates */}
      <div className="mb-4">
        <label className="block mb-1">Pickup Date</label>
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          className="w-full border p-2 rounded"
          min={formatDate(today)}
          max={formatDate(twoWeeksFromToday)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Dropoff Date</label>
        <input
          type="date"
          value={dropoffDate}
          onChange={(e) => setDropoffDate(e.target.value)}
          className="w-full border p-2 rounded"
          min={dropoffMinDate}
        />
      </div>

      {/* Items */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <select
              value={item.type}
              onChange={(e) => updateItem(idx, 'type', e.target.value)}
              className="border p-1 rounded"
            >
              <option value="shirt">Shirt</option>
              <option value="trouser">Trouser</option>
              <option value="tshirt">T-Shirt</option>
              <option value="dress">Dress</option>
              <option value="suit">Suit</option>
              <option value="jacket">Jacket</option>
              <option value="bedsheet">Bedsheet</option>
              <option value="towel">Towel</option>
              <option value="curtains">Curtains</option>
            </select>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
              className="w-20 border p-1 rounded"
            />
            <input
              type="number"
              min={0}
              value={item.pricePerUnit}
              onChange={(e) => updateItem(idx, 'pricePerUnit', Number(e.target.value))}
              className="w-24 border p-1 rounded"
            />
            <button type="button" onClick={() => removeItem(idx)} className="text-red-500">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="bg-green-500 text-white px-3 py-1 rounded mt-2">
          Add Item
        </button>
      </div>

      {/* Total & Submit */}
      <p className="mb-4">
        <strong>Total:</strong> ₦
        {items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0).toLocaleString()}
      </p>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded"
      >
        {loading ? 'Processing...' : 'Pay & Create Order'}
      </button>
    </div>
  );
}
