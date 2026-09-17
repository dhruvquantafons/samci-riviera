"use client";

import { useState } from "react";
import { Utensils, Clock, Sparkles, Award, Coffee, Maximize2, X, ChevronRight, Calendar } from "lucide-react";
import Reveal from "./Reveal";

interface DiningSectionProps {
  onOpenBooking: () => void;
}

export default function DiningSection({ onOpenBooking }: DiningSectionProps) {
  const [selectedModalVenue, setSelectedModalVenue] = useState<null | {
    name: string;
    cuisine: string;
    ambiance: string;
    hours: string;
    dressCode: string;
    image: string;
    description: string;
    highlights: string[];
    tag: string;
  }>(null);

  const venues = [
    {
      name: "Sheesh Mahal Restaurant",
      cuisine: "Authentic Royal Kashmiri Wazwan & Multi-Cuisine",
      ambiance: "Warm & Elegant Dining Hall",
      tag: "Signature Restaurant",
      hours: "Lunch & Dinner: 12:30 PM – 11:00 PM",
      dressCode: "Smart Casual",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
      description: "Savor centuries-old royal Kashmiri recipes and authentic Wazwan delicacies. Enjoy Rogan Josh, Gushtaba, Tabak Maaz, traditional Kahwa tea, and gourmet Indian & Continental favorites prepared fresh daily.",
      highlights: ["Traditional Wazwan Feasts", "Authentic Kashmiri Kahwa", "Fresh Himalayan Trout & Kebabs"],
    },
    {
      name: "The Riviera Cafe & Conservatory",
      cuisine: "Artisanal Breakfast, Coffee & Valley Snacks",
      ambiance: "Bright, Airy & Relaxed Atmosphere",
      tag: "All-Day Cafe & Breakfast",
      hours: "Daily: 7:00 AM – 10:30 PM",
      dressCode: "Casual",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop",
      description: "A delightful space to start your morning with freshly baked breads, extensive breakfast buffets, rich espresso, Kashmiri noon chai, and delectable light bites throughout the day.",
      highlights: ["Artisanal Breakfast Buffet", "Freshly Brewed Coffee & Teas", "Bakery Breads & Pastries"],
    },
  ];

  return (
    <section id="dining" className="py-24 bg-[#1c1b1a] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#e6d7c3] font-semibold mb-3">
            <Utensils className="w-3.5 h-3.5" />
            <span>CULINARY & RESTAURANTS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
            A Culinary <span className="italic font-normal text-[#e6d7c3]">Journey</span>
          </h2>
          <p className="text-stone-300 text-sm font-light tracking-wide mt-4">
            Discover our dining venues, where authentic Kashmiri gastronomy, freshly ground coffees, and warm valley hospitality blend into an unforgettable experience.
          </p>
        </div>

        {/* Photo / Card Grid (Gallery Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {venues.map((venue, idx) => (
            <Reveal
              key={idx}
              delay={idx * 110}
              className="hover-lift bg-[#222120] rounded-xl overflow-hidden border border-white/10 hover:border-[#e6d7c3]/40 group flex flex-col justify-between shadow-2xl"
            >
              <div>
                {/* Photo Header */}
                <div
                  className="relative h-64 sm:h-72 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedModalVenue(venue)}
                >
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 filter brightness-[0.92]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222120] via-black/25 to-black/40" />

                  {/* Top Badge & Expand Icon */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#e6d7c3] font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {venue.tag}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalVenue(venue);
                      }}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#e6d7c3] hover:bg-[#e6d7c3] hover:text-[#1c1b1a] transition-colors"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ambiance Over Photo */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] uppercase tracking-widest text-amber-200/90 font-light">
                      {venue.ambiance}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl text-white font-medium group-hover:text-[#e6d7c3] transition-colors leading-snug">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-[#d9c3a3] font-medium mt-1">
                      {venue.cuisine}
                    </p>
                  </div>

                  <p className="text-xs text-stone-300 font-light leading-relaxed line-clamp-3">
                    {venue.description}
                  </p>

                  {/* Hours & Dress Code Meta */}
                  <div className="space-y-2 border-y border-white/10 py-3 text-xs text-stone-300">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#e6d7c3] shrink-0" />
                      <span className="truncate">{venue.hours}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-3.5 h-3.5 text-[#e6d7c3] shrink-0" />
                      <span className="truncate">{venue.dressCode}</span>
                    </div>
                  </div>

                  {/* Highlight Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {venue.highlights.slice(0, 2).map((h, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-100 font-light"
                      >
                        ✦ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2">
                <button
                  onClick={onOpenBooking}
                  className="w-full py-2.5 text-xs uppercase tracking-widest text-[#1c1b1a] bg-[#e6d7c3] hover:bg-[#d9c3a3] font-semibold rounded-full transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Table</span>
                </button>
                <button
                  onClick={() => setSelectedModalVenue(venue)}
                  className="w-full py-2 text-[11px] uppercase tracking-widest text-slate-300 hover:text-[#e6d7c3] transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Explore Menu & Story</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Concierge Assistance Callout */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#222120]/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-serif text-lg text-white font-medium">
              Private Dining & Celebrations
            </h4>
            <p className="text-xs text-stone-300 font-light mt-1">
              Looking for a custom multi-course royal Wazwan feast or private dining celebration? Our Head Chef and culinary team curate bespoke dining occasions.
            </p>
          </div>
          <button
            onClick={onOpenBooking}
            className="px-6 py-2.5 text-xs uppercase tracking-widest text-[#1c1b1a] bg-[#e6d7c3] hover:bg-[#d9c3a3] font-semibold rounded-full whitespace-nowrap cursor-pointer transition-colors shadow-sm"
          >
            Inquire Concierge
          </button>
        </div>
      </div>

      {/* Culinary Detail Modal / Lightbox */}
      {selectedModalVenue && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1f1e1d] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedModalVenue(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-stone-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 sm:h-72">
              <img
                src={selectedModalVenue.image}
                alt={selectedModalVenue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1e1d] via-transparent to-black/50" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] uppercase tracking-widest text-[#1c1b1a] font-semibold bg-[#e6d7c3] px-3 py-1 rounded-full">
                  {selectedModalVenue.tag}
                </span>
                <h3 className="font-serif text-3xl text-white font-medium mt-2">
                  {selectedModalVenue.name}
                </h3>
                <p className="text-xs text-[#e6d7c3] font-light mt-0.5">
                  {selectedModalVenue.cuisine}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#e6d7c3] font-semibold mb-2">
                  The Experience & Philosophy
                </h4>
                <p className="text-stone-300 text-sm font-light leading-relaxed">
                  {selectedModalVenue.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-300 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#e6d7c3]" />
                  <span><strong>Hours:</strong> {selectedModalVenue.hours}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#e6d7c3]" />
                  <span><strong>Dress Code:</strong> {selectedModalVenue.dressCode}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#e6d7c3] font-semibold mb-3">
                  Signature Highlights & Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedModalVenue.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-amber-100"
                    >
                      ✦ {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedModalVenue(null);
                    onOpenBooking();
                  }}
                  className="w-full py-3.5 px-6 bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] font-semibold text-xs uppercase tracking-widest rounded-full shadow-md text-center cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Table at {selectedModalVenue.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
