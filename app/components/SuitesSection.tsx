"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, Users, Eye, CheckCircle2, ArrowRight, X, BedDouble, Info } from "lucide-react";
import Reveal from "./Reveal";
import type { RoomType, ExtraCharge } from "../lib/types";

/** next/image rejects an empty src, so fall back to a house photograph. */
const PLACEHOLDER_IMAGE = "/gallery/2.jpg";

/**
 * Turns a category key into a tab label. Categories are admin-authored, so
 * "premier" reads as "Premier Rooms" while "royal-suite" reads as
 * "Royal Suites" rather than "Royal-suite Rooms".
 */
function categoryLabel(category: string) {
  const words = category
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (!words) return "Rooms";
  if (/\b(suite|room)s?$/i.test(words)) {
    return words.endsWith("s") ? words : `${words}s`;
  }
  return `${words} Rooms`;
}

interface SuitesSectionProps {
  onOpenBooking: (roomName?: string) => void;
  rooms: RoomType[];
  charges: ExtraCharge[];
}

export default function SuitesSection({ onOpenBooking, rooms, charges }: SuitesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedModalRoom, setSelectedModalRoom] = useState<RoomType | null>(null);

  const filteredRooms = activeTab === "all" ? rooms : rooms.filter((r) => r.category === activeTab);

  // Tabs follow whatever room types an administrator has published.
  const tabs = [
    { id: "all", label: "All Rooms" },
    ...Array.from(new Set(rooms.map((r) => r.category))).map((category) => ({
      id: category,
      label: categoryLabel(category),
    })),
  ];

  return (
    <section id="rooms" className="py-14 sm:py-24 bg-[#f5f3ef] text-[#1c1b1a] relative">
      <div id="suites" className="absolute -top-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#a88956] font-semibold mb-3">
            <BedDouble className="w-3.5 h-3.5" />
            <span>OUR ACCOMMODATIONS</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1c1b1a] leading-tight">
            Refined Rooms, <span className="italic text-[#a88956] font-normal">Thoughtfully Designed</span>
          </h2>
          <p className="text-[#5a5854] text-sm font-light tracking-wide mt-4">
Kashmiri woodwork, plush bedding, and valley views.
          </p>
        </Reveal>

        {/* Tab Filters */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-12 flex-wrap gap-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-xs uppercase tracking-widest font-medium rounded-full transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#e6d7c3] text-[#1c1b1a] shadow-sm font-semibold"
                  : "bg-white text-[#5a5854] border border-[#e5e0d8] hover:border-[#a88956] hover:text-[#1c1b1a]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredRooms.map((room, index) => (
            <Reveal
              key={room.id}
              delay={index * 90}
              className="hover-lift bg-white rounded-xl overflow-hidden border border-[#e5e0d8] hover:border-[#d9c3a3] shadow-sm group flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={room.image || PLACEHOLDER_IMAGE}
                    alt={room.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-[900ms] ease-out filter contrast-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#1c1b1a] border border-[#e5e0d8] px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold">
                    {room.view}
                  </div>

                  {/* Quick Detail Trigger */}
                  <button
                    onClick={() => setSelectedModalRoom(room)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md text-[#1c1b1a] hover:bg-white rounded-full border border-[#e5e0d8] transition-colors shadow-sm cursor-pointer"
                    title="View Room Details"
                    aria-label="View Room Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Price Tag */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-lg border border-[#e5e0d8] shadow-sm">
                    <span className="text-xs text-[#7a7771] font-light">From </span>
                    <span className="font-serif text-xl font-bold text-[#1c1b1a]">₹{Number(room.base_rate).toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-[#7a7771] font-light"> / night</span>
                    <span className="block text-[9px] uppercase tracking-widest text-[#a88956] font-semibold leading-none">CPAI • Taxes Incl.</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl text-[#1c1b1a] font-medium group-hover:text-[#a88956] transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-xs text-[#7a7771] font-light tracking-wide mt-1">
                      {room.tagline}
                    </p>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center space-x-6 text-xs text-[#5a5854] border-y border-[#f0ece5] py-3">
                    <div className="flex items-center space-x-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-[#a88956]" />
                      <span>{room.size}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-[#a88956]" />
                      <span>{room.occupancy}</span>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {room.highlights.map((h, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-[#4a4843]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#a88956] shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedModalRoom(room)}
                  className="text-xs uppercase tracking-widest text-[#7a7771] hover:text-[#1c1b1a] underline underline-offset-4 font-medium transition-colors cursor-pointer"
                >
                  View Room Specs
                </button>

                <button
                  onClick={() => onOpenBooking(room.name)}
                  className="px-5 py-2.5 bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] font-semibold text-xs uppercase tracking-widest rounded-full flex items-center space-x-2 shadow-sm cursor-pointer"
                >
                  <span>Book Room</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1c1b1a]" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Additional Charges Info Panel */}
        <Reveal className="mt-10 rounded-2xl border border-[#e5e0d8] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[#f0ece5] bg-[#faf9f6]">
            <Info className="w-4 h-4 text-[#a88956] shrink-0" />
            <h4 className="font-serif text-base text-[#1c1b1a] font-medium">Additional Charges &amp; Meal Rates</h4>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-[#7a7771] font-medium">Per Person / Per Night</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#f0ece5]">
            {charges.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4 even:bg-[#faf9f6]">
                <span className="text-sm text-[#5a5854] font-light">{item.label}</span>
                <span className="font-serif text-base font-semibold text-[#1c1b1a] ml-4 whitespace-nowrap">₹{Number(item.amount).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-[#f0ece5] bg-[#faf9f6]">
            <p className="text-[11px] text-[#7a7771] font-light">* Room rates are quoted on the <strong className="font-medium text-[#5a5854]">CPAI plan</strong> (Continental Plan — accommodation with breakfast) and are inclusive of applicable taxes. Lunch and dinner are charged separately at the buffet rates above. Prices are subject to change during peak season. Contact us for group and corporate rates.</p>
          </div>
        </Reveal>
      </div>

      {/* Room Detail Modal */}
      {selectedModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#f9f8f5] max-w-2xl w-full rounded-2xl overflow-hidden border border-[#e5e0d8] p-6 relative max-h-[90vh] overflow-y-auto text-[#1c1b1a] shadow-2xl">
            <button
              onClick={() => setSelectedModalRoom(null)}
              className="absolute top-4 right-4 text-[#7a7771] hover:text-[#1c1b1a] p-2 text-lg rounded-full cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <Image
              src={selectedModalRoom.image || PLACEHOLDER_IMAGE}
              alt={selectedModalRoom.name}
              width={1620}
              height={1080}
              className="w-full h-64 object-cover rounded-xl mb-6 border border-[#e5e0d8]"
            />

            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#a88956] font-semibold">
                  {selectedModalRoom.view}
                </span>
                <h3 className="font-serif text-3xl text-[#1c1b1a] font-medium mt-1">
                  {selectedModalRoom.name}
                </h3>
              </div>

              <p className="text-sm text-[#5a5854] font-light leading-relaxed">
                {selectedModalRoom.description}
              </p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#e5e0d8] text-xs text-[#4a4843]">
                <div><strong>Dimensions:</strong> {selectedModalRoom.size}</div>
                <div><strong>Max Guests:</strong> {selectedModalRoom.occupancy}</div>
                <div><strong>Room Service:</strong> 24/7 Available</div>
                <div><strong>Complimentary:</strong> Breakfast & High-Speed Wi-Fi</div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-xs text-[#7a7771]">Nightly Rate: </span>
                  <span className="font-serif text-2xl text-[#1c1b1a] font-bold">
                    ₹{Number(selectedModalRoom.base_rate).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-[#7a7771] font-light mt-0.5">
                    On CPAI (room with breakfast), inclusive of applicable taxes.
                  </span>
                </div>

                <button
                  onClick={() => {
                    const name = selectedModalRoom.name;
                    setSelectedModalRoom(null);
                    onOpenBooking(name);
                  }}
                  className="px-6 py-3 bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] font-semibold text-xs uppercase tracking-widest rounded-full shadow-md cursor-pointer"
                >
                  Book This Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
