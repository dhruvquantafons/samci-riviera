"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, ChevronRight, Play, Volume2, VolumeX, Sparkles, MapPin, Award } from "lucide-react";

interface HeroSectionProps {
  onOpenBooking: (params?: { checkIn?: string; checkOut?: string; guests?: number; suite?: string }) => void;
}

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
    tagline: "HOTEL SAMCI RIVIERA",
    heading: "Where Valley Serenity Meets Warm Hospitality",
    subtext: "Nestled in Srinagar near the scenic Jhelum River, experience refined rooms, authentic Kashmiri hospitality, and peaceful valley charm.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
    tagline: "ELEGANT COMFORTS",
    heading: "Thoughtfully Designed Deluxe Accommodations",
    subtext: "Relax in rooms featuring handcrafted Kashmiri woodwork, comfortable bedding, modern conveniences, and dedicated round-the-clock service.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
    tagline: "EPICUREAN HAVEN",
    heading: "Authentic Dining & Culinary Delights",
    subtext: "Savor exquisite Kashmiri Wazwan heritage recipes and international favorites crafted with the freshest local ingredients.",
  },
];

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Quick reservation state
  const [checkIn, setCheckIn] = useState("2026-10-15");
  const [checkOut, setCheckOut] = useState("2026-10-18");
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState("Executive Deluxe Room");

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking({ checkIn, checkOut, guests, suite: roomType });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-28 sm:pt-32 pb-12 overflow-hidden bg-[#070c12]">
      {/* Background Media Carousel */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-105 transition-transform duration-[10000ms]" : "opacity-0 scale-100 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.heading}
              className="w-full h-full object-cover filter brightness-[0.68] contrast-[1.08]"
            />
            {/* Gradient Overlays for Readability & Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b131b] via-[#0b131b]/40 to-black/60" />
            <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/70" />
          </div>
        ))}
      </div>

      {/* Floating Controls Bar (Positioned below main sticky header) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full flex justify-between items-center text-xs text-amber-100/80 mb-4 pt-4">
        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/20 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="tracking-wider uppercase text-[11px] font-medium text-slate-200">Dal Lake • Srinagar, Kashmir</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-amber-500/20 text-amber-200 hover:text-white transition-colors"
            title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-amber-500/20 text-amber-200 hover:text-white transition-colors"
            title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? "opacity-70" : "opacity-100 text-[#d4af37]"}`} />
          </button>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center my-auto py-12">
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs tracking-[0.3em] uppercase mb-6 animate-pulse">
          <Award className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>{HERO_SLIDES[currentSlide].tagline}</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-wide leading-tight mb-6 drop-shadow-2xl">
          {HERO_SLIDES[currentSlide].heading.split(" ").map((word, i) => (
            <span key={i} className={word === "Majesty" || word === "Tranquility" || word === "Imperial" || word === "Fine" ? "gold-text-gradient font-normal italic" : ""}>
              {word}{" "}
            </span>
          ))}
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-light tracking-widest leading-relaxed mb-8 drop-shadow-md">
          {HERO_SLIDES[currentSlide].subtext}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onOpenBooking()}
            className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold text-[#1c1b1a] bg-[#e6d7c3] hover:bg-[#d9c3a3] rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Book Your Room</span>
            <ChevronRight className="w-4 h-4 text-[#1c1b1a]" />
          </button>

          <a
            href="#rooms"
            className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-medium text-white hover:text-amber-100 bg-black/30 hover:bg-black/50 border border-white/30 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <span>View All Rooms</span>
          </a>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center space-x-3 mt-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-500 rounded-full ${
                idx === currentSlide ? "w-10 bg-[#e6d7c3]" : "w-3 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Integrated Quick Reservation Bar at Hero Bottom */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 w-full mt-6">
        <form
          onSubmit={handleQuickBook}
          className="bg-[#1c1b1a]/80 backdrop-blur-xl p-4 sm:p-5 rounded-xl shadow-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          {/* Check-In */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#d9c3a3]" /> Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-[#2a2927] border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#d9c3a3] w-full"
            />
          </div>

          {/* Check-Out */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#d9c3a3]" /> Check-Out Date
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-[#2a2927] border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#d9c3a3] w-full"
            />
          </div>

          {/* Guests */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-medium flex items-center gap-1.5">
              <Users className="w-3 h-3 text-[#d9c3a3]" /> Guests & Rooms
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="bg-[#2a2927] border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#d9c3a3] w-full"
            >
              <option value={1}>1 Guest • 1 Room</option>
              <option value={2}>2 Guests • 1 Room</option>
              <option value={3}>3 Guests • 1 Family Room</option>
              <option value={4}>4 Guests • 2 Rooms</option>
            </select>
          </div>

          {/* Room Category */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#d9c3a3]" /> Room Category
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="bg-[#2a2927] border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#d9c3a3] w-full truncate"
            >
              <option value="Executive Deluxe Room">Executive Deluxe Room</option>
              <option value="Super Deluxe Room">Super Deluxe Room</option>
              <option value="Premium Family Room">Premium Family Room</option>
              <option value="Classic Deluxe Room">Classic Deluxe Room</option>
            </select>
          </div>

          {/* Submit Search */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] font-semibold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer h-[38px]"
          >
            <span>Check Rates</span>
            <ChevronRight className="w-4 h-4 text-[#1c1b1a]" />
          </button>
        </form>
      </div>
    </section>
  );
}
