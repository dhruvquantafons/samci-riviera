"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Calendar,
  Users,
  Tag,
  ChevronDown,
  Search,
  Minus,
  Plus,
  Phone,
  Sparkles,
  CheckCircle2,
  Building2,
} from "lucide-react";

interface BookingWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIAL_CODES = [
  { value: "", label: "Standard Direct Rate" },
  { value: "CORP", label: "Corporate Rate" },
  { value: "HONEY", label: "Honeymoon Package" },
  { value: "EARLYBIRD", label: "Early Bird Offer" },
  { value: "LONGSTAY", label: "Long Stay Discount" },
];

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const toIso = (d: Date) => d.toISOString().split("T")[0];

export default function BookingWidget({ isOpen, onClose }: BookingWidgetProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [checkIn, setCheckIn] = useState(toIso(today));
  const [checkOut, setCheckOut] = useState(toIso(tomorrow));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [specialCode, setSpecialCode] = useState("");

  const [guestOpen, setGuestOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setGuestOpen(false);
      setCodeOpen(false);
      setDateOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut + "T00:00:00").getTime() - new Date(checkIn + "T00:00:00").getTime()) /
        86400000
    )
  );

  const guestSummary = `${adults} Adult${adults !== 1 ? "s" : ""}${
    children > 0 ? `, ${children} Child${children !== 1 ? "ren" : ""}` : ""
  } \u2013 ${rooms} Room${rooms !== 1 ? "s" : ""}`;

  const selectedCodeLabel = SPECIAL_CODES.find((c) => c.value === specialCode)?.label ?? "Standard Direct Rate";

  const handleCheckRates = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  const renderCounter = (
    label: string,
    hint: string,
    val: number,
    min: number,
    max: number,
    set: (v: number) => void
  ) => (
    <div className="flex items-center justify-between py-3 border-b border-[#f5f2ed] last:border-none">
      <div>
        <p className="text-sm font-medium text-[#1c1b1a] leading-none">{label}</p>
        {hint && <p className="text-[11px] text-[#9a9490] mt-1">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(Math.max(min, val - 1))}
          disabled={val <= min}
          className="w-8 h-8 rounded-full border border-[#d9c3a3] flex items-center justify-center text-[#a88956] hover:bg-[#fdf6ec] disabled:opacity-25 transition cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center font-serif text-lg font-semibold text-[#1c1b1a] leading-none">
          {val}
        </span>
        <button
          type="button"
          onClick={() => set(Math.min(max, val + 1))}
          disabled={val >= max}
          className="w-8 h-8 rounded-full border border-[#d9c3a3] flex items-center justify-center text-[#a88956] hover:bg-[#fdf6ec] disabled:opacity-25 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Full-screen backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Booking Popup Card Container */}
      <div
        ref={widgetRef}
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-[#e5e0d8] my-auto"
      >
        {/* ── CARD HEADER with prominent CROSS (X) BUTTON at Top Right ── */}
        <div className="bg-[#1c1b1a] px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#a88956]/20 border border-[#a88956]/40 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#e6d7c3]" />
            </div>
            <div>
              <h3 className="font-serif text-base text-[#e6d7c3] font-medium tracking-wide uppercase">
                Hotel Samci Riviera
              </h3>
              <p className="text-[10px] text-[#9a9490] tracking-widest uppercase">
                Palace & Resort • Srinagar
              </p>
            </div>
          </div>

          {/* ✖ CROSS BUTTON AT TOP RIGHT ✖ */}
          <button
            onClick={onClose}
            aria-label="Close booking popup"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#a88956] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer group shadow-sm shrink-0"
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
          </button>
        </div>

        {!submitted ? (
          <div className="p-6 space-y-4">
            {/* Tagline / direct booking benefit */}
            <div className="bg-[#faf8f5] border border-[#eee8df] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#5a5854]">
              <span className="flex items-center gap-1.5 font-medium text-[#1c1b1a]">
                <Sparkles className="w-3.5 h-3.5 text-[#a88956]" /> Direct Direct Reservation
              </span>
              <span className="text-[#a88956] font-semibold text-[11px]">Best Rate Guaranteed</span>
            </div>

            {/* Form Fields Stack */}
            <div className="border border-[#ede9e2] rounded-xl overflow-hidden divide-y divide-[#ede9e2] bg-white shadow-sm">
              {/* ── Field 1: Check-In & Check-Out Dates ── */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDateOpen(!dateOpen);
                    setGuestOpen(false);
                    setCodeOpen(false);
                  }}
                  className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#fdfcfa] transition-colors text-left group"
                >
                  <Calendar className="w-4 h-4 text-[#a88956] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">
                      Dates of Stay ({nights} Night{nights !== 1 ? "s" : ""})
                    </p>
                    <p className="text-sm font-medium text-[#1c1b1a] mt-0.5">
                      {fmtDate(checkIn)} &nbsp;<span className="text-[#a88956]">—</span>&nbsp; {fmtDate(checkOut)}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9a9490] group-hover:text-[#a88956] transition-transform ${
                      dateOpen ? "rotate-180 text-[#a88956]" : ""
                    }`}
                  />
                </button>

                {/* Date Selection Popover */}
                {dateOpen && (
                  <div className="p-4 bg-[#faf8f5] border-t border-[#ede9e2] animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#7a7771] font-semibold block mb-1">
                          Check-In Date
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          min={toIso(today)}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            if (e.target.value >= checkOut) {
                              const d = new Date(e.target.value + "T00:00:00");
                              d.setDate(d.getDate() + 1);
                              setCheckOut(toIso(d));
                            }
                          }}
                          className="w-full text-xs font-medium text-[#1c1b1a] bg-white border border-[#e5e0d8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#a88956]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#7a7771] font-semibold block mb-1">
                          Check-Out Date
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full text-xs font-medium text-[#1c1b1a] bg-white border border-[#e5e0d8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#a88956]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDateOpen(false)}
                      className="mt-3 w-full py-1.5 text-center text-xs font-semibold text-[#a88956] hover:text-[#1c1b1a] transition-colors"
                    >
                      Done Selecting Dates
                    </button>
                  </div>
                )}
              </div>

              {/* ── Field 2: Guests & Rooms Counter ── */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setGuestOpen(!guestOpen);
                    setDateOpen(false);
                    setCodeOpen(false);
                  }}
                  className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#fdfcfa] transition-colors text-left group"
                >
                  <Users className="w-4 h-4 text-[#a88956] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">
                      Guests & Accommodations
                    </p>
                    <p className="text-sm font-medium text-[#1c1b1a] mt-0.5 truncate">
                      {guestSummary}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9a9490] group-hover:text-[#a88956] transition-transform ${
                      guestOpen ? "rotate-180 text-[#a88956]" : ""
                    }`}
                  />
                </button>

                {/* Guests Counter Popover */}
                {guestOpen && (
                  <div className="p-4 bg-[#faf8f5] border-t border-[#ede9e2] animate-in slide-in-from-top-1 duration-200">
                    {renderCounter("Adults", "Age 11+ years", adults, 1, 6, setAdults)}
                    {renderCounter("Children", "Age 5–10 years", children, 0, 4, setChildren)}
                    {renderCounter("Rooms", "Number of rooms required", rooms, 1, 5, setRooms)}
                    <button
                      type="button"
                      onClick={() => setGuestOpen(false)}
                      className="mt-3 w-full py-2 bg-[#a88956] hover:bg-[#8f7343] text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Confirm Guest Count
                    </button>
                  </div>
                )}
              </div>

              {/* ── Field 3: Special Offer Code ── */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCodeOpen(!codeOpen);
                    setGuestOpen(false);
                    setDateOpen(false);
                  }}
                  className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#fdfcfa] transition-colors text-left group"
                >
                  <Tag className="w-4 h-4 text-[#a88956] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">
                      Special Promo / Code
                    </p>
                    <p className={`text-sm font-medium mt-0.5 ${specialCode ? "text-[#a88956]" : "text-[#1c1b1a]"}`}>
                      {selectedCodeLabel}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9a9490] group-hover:text-[#a88956] transition-transform ${
                      codeOpen ? "rotate-180 text-[#a88956]" : ""
                    }`}
                  />
                </button>

                {/* Promo Code Selection */}
                {codeOpen && (
                  <div className="bg-[#faf8f5] border-t border-[#ede9e2] divide-y divide-[#ede9e2] animate-in slide-in-from-top-1 duration-200">
                    {SPECIAL_CODES.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSpecialCode(opt.value);
                          setCodeOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-xs transition-colors cursor-pointer ${
                          specialCode === opt.value
                            ? "bg-[#fdf6ec] text-[#a88956] font-semibold"
                            : "text-[#1c1b1a] hover:bg-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Action CTA Button ── */}
            <button
              type="button"
              onClick={handleCheckRates}
              className="w-full py-4 bg-[#a88956] hover:bg-[#8f7343] text-white font-bold text-xs uppercase tracking-[0.25em] rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>CHECK RATES & AVAILABILITY</span>
            </button>

            {/* Direct Phone Support */}
            <div className="pt-2 text-center border-t border-[#ede9e2]">
              <a
                href="tel:+919070090713"
                className="inline-flex items-center gap-2 text-xs text-[#7a7771] hover:text-[#a88956] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#a88956]" />
                <span>Concierge Desk:&nbsp;<strong className="text-[#1c1b1a] font-medium">+91 90700 90713</strong></span>
              </a>
            </div>
          </div>
        ) : (
          /* ── Confirmation / Search Screen ── */
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#a88956]/15 text-[#a88956] flex items-center justify-center border border-[#a88956]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-2xl text-[#1c1b1a] font-medium">Checking Room Availability…</h4>
            <p className="text-xs text-[#7a7771] max-w-xs leading-relaxed">
              Searching available Premier & Luxury rooms for <strong>{nights} night(s)</strong>, <strong>{adults} guest(s)</strong> at Hotel Samci Riviera.
            </p>
            <div className="pt-2 text-xs text-[#a88956] font-medium">
              Direct Desk:&nbsp;
              <a href="tel:+919070090713" className="underline font-bold">
                +91 90700 90713
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
