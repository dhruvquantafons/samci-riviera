"use client";

import { useState, useEffect } from "react";
import { Phone, Menu, X, Calendar, Sparkles } from "lucide-react";

interface NavbarProps {
  onOpenBooking: (suiteName?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Overview", href: "#overview" },
    { name: "Rooms", href: "#rooms" },
    { name: "Dining", href: "#dining" },
    { name: "Experiences", href: "#experiences" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#f9f8f5]/95 backdrop-blur-md shadow-sm py-4 border-b border-[#e5e0d8]"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="group flex flex-col items-start focus:outline-none">
          <span
            className={`font-serif text-2xl sm:text-3xl font-bold tracking-[0.22em] uppercase group-hover:opacity-80 transition-all duration-300 ${
              scrolled ? "text-[#1c1b1a]" : "text-white"
            }`}
          >
            SAMCI RIVIERA
          </span>
          <span
            className={`text-[9px] tracking-[0.35em] uppercase -mt-0.5 font-light ${
              scrolled ? "text-[#7a7771]" : "text-amber-100/80"
            }`}
          >
            PALACE & RESORT • SRINAGAR
          </span>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 font-medium relative group py-1 ${
                scrolled
                  ? "text-[#2c2b29] hover:text-[#a88956]"
                  : "text-slate-100 hover:text-amber-200"
              }`}
            >
              {link.name}
              <span
                className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full ${
                  scrolled ? "bg-[#a88956]" : "bg-amber-200"
                }`}
              />
            </a>
          ))}
        </nav>

        {/* Right Action */}
        <div className="hidden sm:flex items-center space-x-6">
          <a
            href="tel:+919070090713"
            className={`flex items-center space-x-2 text-xs transition-colors group ${
              scrolled ? "text-[#4a4843] hover:text-[#1c1b1a]" : "text-slate-200 hover:text-white"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#b89c72]" />
            <span className="hidden xl:inline text-[11px] tracking-wider font-mono">+91 90700 90713</span>
          </a>

          <button
            onClick={() => onOpenBooking()}
            className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#1c1b1a] transition-all duration-300 rounded-full bg-[#e6d7c3] hover:bg-[#d9c3a3] shadow-md cursor-pointer flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5 text-[#1c1b1a]" />
            <span>Book Stay</span>
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => onOpenBooking()}
            className="px-3.5 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-[#1c1b1a] bg-[#e6d7c3] rounded-full"
          >
            Book
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1 focus:outline-none ${scrolled ? "text-[#1c1b1a]" : "text-white"}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b131b]/98 backdrop-blur-xl flex flex-col justify-between p-6 md:hidden animate-in fade-in duration-300">
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-500/20">
              <div>
                <div className="font-serif text-2xl font-bold tracking-widest gold-text-gradient">
                  SAMCI RIVIERA
                </div>
                <div className="text-[9px] tracking-widest text-amber-200/60 uppercase">
                  Palace & Resort • Srinagar
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-amber-200 hover:text-white p-2"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <nav className="flex flex-col space-y-5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-xl text-slate-200 hover:text-[#d4af37] tracking-wider transition-colors border-b border-white/5 pb-2"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-xl text-slate-200 hover:text-[#d4af37] tracking-wider transition-colors border-b border-white/5 pb-2"
              >
                Gallery
              </a>
            </nav>
          </div>

          <div className="space-y-4 pt-6 border-t border-amber-500/20">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Direct Concierge:</span>
              <a href="tel:+919070090713" className="text-[#d4af37] font-mono font-medium">
                +91 90700 90713
              </a>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-black bg-gradient-to-r from-[#f3e5ab] via-[#d4af37] to-[#aa771c] rounded-sm text-center shadow-lg cursor-pointer"
            >
              Reserve A Room
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
