'use client' 

import Link from "next/link"

export default function Button() {
    return (
      <Link href="/login"> 

        <button
        className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-xl shadow-cyan-500/30 hover:cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 overflow-hidden"
        >
        <span className="relative z-10">Book an Appointment</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
      
      </Link>
    );
  }