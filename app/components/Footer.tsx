"use client";

import { MapPin, Phone, Mail, Award, Sparkles, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#141312] border-t border-white/10 text-slate-400 font-sans relative overflow-hidden">
      {/* Top Awards Bar */}
      <div className="border-b border-white/10 py-10 bg-[#1a1918]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#e6d7c3] font-semibold flex items-center justify-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#e6d7c3]" />
              <span>GLOBAL RECOGNITION & ACCLAIM</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-[#222120] rounded-xl border border-white/5">
              <div className="font-serif text-xl text-white font-medium">Condé Nast Traveler</div>
              <div className="text-[11px] text-[#e6d7c3] tracking-widest mt-1">GOLD LIST 2026</div>
            </div>

            <div className="p-4 bg-[#222120] rounded-xl border border-white/5">
              <div className="font-serif text-xl text-white font-medium">Forbes Travel Guide</div>
              <div className="text-[11px] text-[#e6d7c3] tracking-widest mt-1">FIVE-STAR AWARD</div>
            </div>

            <div className="p-4 bg-[#222120] rounded-xl border border-white/5">
              <div className="font-serif text-xl text-white font-medium">World Luxury Hotels</div>
              <div className="text-[11px] text-[#e6d7c3] tracking-widest mt-1">BEST PALACE RESORT</div>
            </div>

            <div className="p-4 bg-[#222120] rounded-xl border border-white/5">
              <div className="font-serif text-xl text-white font-medium">Michelin Guide</div>
              <div className="text-[11px] text-[#e6d7c3] tracking-widest mt-1">3 RED KEYS SELECTION</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Info Column */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="font-serif text-3xl font-bold tracking-[0.25em] text-[#e6d7c3] uppercase">
                SAMCI RIVIERA
              </span>
              <div className="text-[10px] tracking-[0.4em] text-slate-400 font-sans uppercase">
                PALACE & RESORT • SRINAGAR
              </div>
            </div>

            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Situated at the prime location in the heart of Srinagar, at the bank of the Jhelum River, Hotel Samci Riviera offers warm Kashmiri hospitality, modern comfort, and a memorable stay just 1.5 km from Dal Lake.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#e6d7c3] shrink-0" />
                <span>Dal Lake, Boulevard Road, Srinagar 190001, Jammu & Kashmir, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#e6d7c3] shrink-0" />
                <span>0194-3500113 &nbsp;|&nbsp; +91 90700 90713 &nbsp;|&nbsp; 0194-3517164</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#e6d7c3] shrink-0" />
                <a href="mailto:info@hotelsamciriviera.com" className="hover:text-[#e6d7c3] transition-colors">info@hotelsamciriviera.com</a>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-base text-white font-medium border-b border-white/10 pb-2">
              Our Rooms
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#rooms" className="hover:text-[#e6d7c3] transition-colors">Premier Rooms – ₹9,499/night</a></li>
              <li><a href="#rooms" className="hover:text-[#e6d7c3] transition-colors">Luxury Rooms – ₹10,799/night</a></li>
              <li><a href="#rooms" className="hover:text-[#e6d7c3] transition-colors">All Accommodations</a></li>
            </ul>
          </div>

          {/* Dining & Experiences Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-base text-white font-medium border-b border-white/10 pb-2">
              Dining & Experiences
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#dining" className="hover:text-[#e6d7c3] transition-colors">Sheesh Mahal Restaurant</a></li>
              <li><a href="#dining" className="hover:text-[#e6d7c3] transition-colors">The Riviera Cafe & Breakfast</a></li>
              <li><a href="#experiences" className="hover:text-[#e6d7c3] transition-colors">Private Candlelight Dining</a></li>
              <li><a href="#experiences" className="hover:text-[#e6d7c3] transition-colors">Sunset Shikara Cruise</a></li>
              <li><a href="#gallery" className="hover:text-[#e6d7c3] transition-colors">Palace Photo Gallery</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-serif text-base text-white font-medium border-b border-white/10 pb-2">
              The Royal Gazette
            </h4>
            <p className="text-xs text-slate-400 font-light">
              Subscribe to receive exclusive seasonal rates, room offers, and curated Kashmiri event updates.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to The Royal Gazette."); }} className="space-y-2">
              <div className="flex items-center">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="bg-[#222120] border border-white/10 text-xs text-white px-3.5 py-2.5 rounded-l-full focus:outline-none focus:border-[#e6d7c3] flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] px-4 py-2.5 rounded-r-full font-semibold transition-opacity"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4 text-[#1c1b1a]" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                We honor your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Samci Riviera Palace & Resort. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-[#e6d7c3] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#e6d7c3] transition-colors">Terms of Luxury Service</a>
            <a href="#" className="hover:text-[#e6d7c3] transition-colors">Accessibility</a>
            <a href="#" className="hover:text-[#e6d7c3] transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
