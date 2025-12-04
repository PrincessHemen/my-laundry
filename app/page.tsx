'use client'
import Image from "next/image"; 
import Button from "./components/layout/Button";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white relative overflow-hidden">

      {/* Decorative SVG Circle */}
      <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-10 pointer-events-none" viewBox="0 0 200 200">
        <circle cx="50" cy="100" r="80" fill="url(#blueGradient)" />
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Header */}
      <Header />
      
      {/* Main section: bio + image */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10">
        {/* Content */}
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl">
          {/* Bio */}
          <div className="text-center md:text-left max-w-md">
            <h2 className="text-5xl font-extrabold mb-6 leading-tight">
              Laundry Made Easy.{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Pickup. Clean. Deliver.
              </span>
            </h2>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              MyLaundry helps you save time by handling your washing, drying,
              folding, and ironing with professional care. Book a pickup and let our 
              team take care of the rest — clean, fresh, and fast.
            </p>
            <Button />
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
            <Image
              src="/filip-mroz-gma1zfS3_6E-unsplash.jpg" 
              alt="Laundry Service"
              width={280}
              height={280}
              className="relative rounded-3xl shadow-2xl ring-4 ring-blue-400/30 hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}