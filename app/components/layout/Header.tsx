

export default function Header() {
    return (
      <header className="w-full py-6 px-8 bg-blue-950/60 backdrop-blur-md border-b border-cyan-500/20 flex items-center justify-between shadow-lg shadow-blue-900/20">
        <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
          My Laundry
        </h1>
  
        <nav className="flex items-center gap-8 text-sm font-medium">
          <a href="/" className="text-blue-200 hover:text-cyan-300 transition-colors duration-200">
            Home
          </a>
          <a href="/login" className="text-blue-200 hover:text-cyan-300 transition-colors duration-200">
            Book
          </a>
          <a href="/contact" className="text-blue-200 hover:text-cyan-300 transition-colors duration-200">
            Contact
          </a>
        </nav>
      </header>
    );
  }