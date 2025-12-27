
'use client'

// app/dashboard/page.tsx

// List all a particular customer's orders and their current state 

import ProtectedRoute from '../components/ProtectedRoutes';
import Header from '../components/layout/Header';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';


const DashboardPage = () => {

  useEffect(() => {
    document.title = "Dashboard | MyLaundry";
  }, [])

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        
        <Header />

        {/* Welcome message */}
        {user && (
          <p className="text-xl font-semibold mb-4">
            Welcome, {user.displayName || user.email}!
          </p>
        )}
        
        <h1>Customer Dashboard</h1>
        <p>This page will show all the customer's orders.</p>
      
      </div>
    </ProtectedRoute> 
  );
};

export default DashboardPage; 