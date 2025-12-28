
'use client'

// app/dashboard/page.tsx

// List all a particular customer's orders and their current state 

import ProtectedRoute from '../components/ProtectedRoutes';
import Header from '../components/layout/Header';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';



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

        <main className="max-w-5xl mx-auto w-full px-6 py-10">
          
          {/* Welcome */}
          {user && (
            <h1 className="text-2xl font-semibold mb-6">
              Welcome, {user.displayName || user.email} 👋
            </h1>
          )}

        </main>
      
      </div>
    </ProtectedRoute> 
  );
};

export default DashboardPage; 