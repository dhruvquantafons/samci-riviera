"use client";

import { Sparkles, MapPin, BedDouble, Utensils, Building2, ArrowUpRight } from "lucide-react";

export default function WelcomeSection() {
  const features = [
    {
      icon: MapPin,
      title: "Prime Location",
      description: "Just 1.5 km from Dal Lake and Lal Chowk, at the bank of the Jhelum River — the heart of Srinagar.",
    },
    {
      icon: BedDouble,
      title: "33 Deluxe Rooms",
      description: "Newly refurbished rooms with LED TV, Mini Bar, AC/Centralised Heating, Tea & Coffee Maker, and Electronic Locks.",
    },
    {
      icon: Utensils,
      title: "Authentic Kashmiri Dining",
      description: "Savor traditional Wazwan cuisine and freshly brewed Kahwa in our signature Sheesh Mahal Restaurant.",
    },
    {
      icon: Building2,
      title: "Conference & Events",
      description: "Versatile meeting space for events, residential conferences, and corporate gatherings in the valley.",
    },
  ];

  return (
    <section id="overview" className="py-24 bg-[#f9f8f5] text-[#1c1b1a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-xl overflow-hidden border border-[#e5e0d8] shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop"
                alt="Samci Riviera Palace Exterior"
                className="w-full h-[520px] object-cover filter contrast-[1.03] group-hover:scale-105 transition-transform duration-700"
              />

              {/* Location Emblem */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-lg border border-[#e5e0d8] shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#a88956] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#a88956]" />
                    <span>Hotel Samci Riviera</span>
                  </div>
                  <div className="text-sm font-serif text-[#1c1b1a] font-medium mt-0.5">
                    At the bank of the Jhelum River, Srinagar
                  </div>
                </div>
                <div className="text-right pl-4 border-l border-[#e5e0d8]">
                  <div className="font-serif text-xl font-bold text-[#a88956]">1.5 km</div>
                  <div className="text-[10px] text-[#7a7771] tracking-wider font-sans">FROM DAL LAKE</div>
                </div>
              </div>
            </div>

            {/* Secondary Accent Image Overlay */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 w-56 h-56 rounded-xl overflow-hidden border-4 border-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1780&auto=format&fit=crop"
                alt="Palace Courtyard"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Text Content Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#a88956] font-semibold">
              <span className="w-8 h-[1px] bg-[#a88956]" />
              <span>ABOUT THE HOTEL</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1c1b1a] leading-tight">
              A Prime Location <span className="italic text-[#a88956] font-normal">in the Valley</span>
            </h2>

            <p className="text-[#5a5854] text-sm sm:text-base font-light leading-relaxed tracking-wide">
              <strong>Hotel Samci Riviera Srinagar</strong> is situated at the prime location in the valley of Kashmir — suitable for the needs of Leisure &amp; Corporate travellers — making us the ideal venue for a comfortable stay.
            </p>

            <p className="text-[#7a7771] text-xs sm:text-sm font-light leading-relaxed">
              Situated just 1.5 km from the famous Dal Lake and Lal Chowk, right at the bank of the Jhelum River. The hotel features 33 Deluxe Rooms, 03 Royal Suites, and 02 Presidential Suites — all newly refurbished with LED TV, Mini Bar, Air Conditioning / Centralised Heating, Tea &amp; Coffee Maker, Electronic Locks, and premium in-room amenities. We also offer versatile meeting space for events and residential conferences.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {features.map((feat, idx) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-white border border-[#e5e0d8] hover:border-[#d9c3a3] shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#f5f3ef] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <IconComp className="w-4 h-4 text-[#a88956]" />
                    </div>
                    <h3 className="font-serif text-base text-[#1c1b1a] font-medium mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#7a7771] leading-relaxed font-light">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action link */}
            <div className="pt-2">
              <a
                href="#rooms"
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-[#1c1b1a] hover:text-[#a88956] transition-colors group font-semibold"
              >
                <span>Explore Our Rooms</span>
                <ArrowUpRight className="w-4 h-4 text-[#a88956] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
