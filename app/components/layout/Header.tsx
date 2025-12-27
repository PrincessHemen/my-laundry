"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation"; 


export default function Header() {

  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);


  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.replace("/login");
  };


    return (
      <header className="w-full py-6 px-6 bg-blue-950/60 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-blue-900/20">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-xl font-black tracking-wide bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
          My Laundry
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/" className="text-blue-200 hover:text-cyan-300">Home</a>
          <a href="/login" className="text-blue-200 hover:text-cyan-300">Book</a>
          <a href="/contact" className="text-blue-200 hover:text-cyan-300">Contact</a>

          {user && (
            <button
              onClick={handleLogout}
              className="text-blue-200 hover:text-red-300"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile Burger Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden text-blue-200 focus:outline-none"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <nav className="md:hidden mt-4 flex flex-col gap-4 text-sm font-medium bg-blue-950/80 rounded-lg p-4 border border-cyan-500/20">
          <a
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-blue-200 hover:text-cyan-300"
          >
            Home
          </a>
          <a
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-blue-200 hover:text-cyan-300"
          >
            Book
          </a>
          <a
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="text-blue-200 hover:text-cyan-300"
          >
            Contact
          </a>

          {user && (
            <button
              onClick={handleLogout}
              className="text-left text-blue-200 hover:text-red-300"
            >
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
    );
  }