export default function Footer() {
    return (
      <footer className="w-full py-8 px-6 bg-gradient-to-r from-indigo-950 via-blue-950 to-blue-900 border-t border-cyan-500/20 text-center text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none"></div>
        <p className="text-blue-200 relative z-10">
          © {new Date().getFullYear()} My Laundry — Clean Laundry. Clean Service. 
        </p>
      </footer>
    );
  }