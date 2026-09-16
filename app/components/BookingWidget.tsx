"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import {
  X,
  Calendar,
  Users,
  Tag,
  ChevronDown,
  Minus,
  Plus,
  Phone,
  Sparkles,
  Building2,
  CheckCircle2,
  Send,
} from "lucide-react";
import type { RoomType } from "../lib/types";
import { submitBookingRequest, type RequestState } from "../lib/booking-request";

interface BookingWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Room types offered in the picker, driven by the admin panel. */
  roomTypes: RoomType[];
  /** Pre-selects a room when the guest arrived from a specific room card. */
  preselectedRoom?: string;
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

export default function BookingWidget({
  isOpen,
  onClose,
  roomTypes,
  preselectedRoom = "",
}: BookingWidgetProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [checkIn, setCheckIn] = useState(toIso(today));
  const [checkOut, setCheckOut] = useState(toIso(tomorrow));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [specialCode, setSpecialCode] = useState("");
  const [roomTypeId, setRoomTypeId] = useState(
    () => roomTypes.find((rt) => rt.name === preselectedRoom)?.id ?? roomTypes[0]?.id ?? "",
  );

  const [state, formAction, pending] = useActionState<RequestState, FormData>(
    submitBookingRequest,
    {},
  );

  const [guestOpen, setGuestOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

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

        {state.success ? (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-xl text-[#1c1b1a] font-medium">Request received</h4>
            <p className="text-xs text-[#7a7771] leading-relaxed max-w-xs">{state.success}</p>
            <a
              href="tel:+919070090713"
              className="inline-flex items-center gap-2 text-xs text-[#a88956] hover:text-[#8f7343] transition-colors pt-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Or call us now on +91 90700 90713</span>
            </a>
            <button type="button" onClick={onClose} className="text-[11px] text-[#9a9490] underline pt-1 cursor-pointer">
              Close
            </button>
          </div>
        ) : (
        <form action={formAction} className="p-6 space-y-4">
          {/* Tagline / direct booking benefit */}
          <div className="bg-[#faf8f5] border border-[#eee8df] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#5a5854]">
            <span className="flex items-center gap-1.5 font-medium text-[#1c1b1a]">
              <Sparkles className="w-3.5 h-3.5 text-[#a88956]" /> Direct Reservation
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

          {/* Values chosen in the pickers above */}
          <input type="hidden" name="check_in" value={checkIn} />
          <input type="hidden" name="check_out" value={checkOut} />
          <input type="hidden" name="adults" value={adults} />
          <input type="hidden" name="children" value={children} />
          <input type="hidden" name="rooms_count" value={rooms} />
          <input type="hidden" name="promo_code" value={specialCode} />

          {/* ── Room & contact details ── */}
          <div className="space-y-3 pt-1">
            {roomTypes.length > 0 && (
              <label className="block">
                <span className="block text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold mb-1">
                  Room
                </span>
                <select
                  name="room_type_id"
                  value={roomTypeId}
                  onChange={(e) => setRoomTypeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede9e2] rounded-xl text-[#1c1b1a] focus:outline-none focus:border-[#a88956]"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} — ₹{Number(rt.base_rate).toLocaleString("en-IN")} / night
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold mb-1">
                  Your name
                </span>
                <input
                  name="contact_name"
                  required
                  autoComplete="name"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede9e2] rounded-xl text-[#1c1b1a] focus:outline-none focus:border-[#a88956]"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold mb-1">
                  Phone
                </span>
                <input
                  name="contact_phone"
                  type="tel"
                  autoComplete="tel"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede9e2] rounded-xl text-[#1c1b1a] focus:outline-none focus:border-[#a88956]"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold mb-1">
                Email
              </span>
              <input
                name="contact_email"
                type="email"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede9e2] rounded-xl text-[#1c1b1a] focus:outline-none focus:border-[#a88956]"
              />
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold mb-1">
                Anything we should know?
              </span>
              <textarea
                name="special_requests"
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ede9e2] rounded-xl text-[#1c1b1a] focus:outline-none focus:border-[#a88956]"
              />
            </label>
          </div>

          {state.error && (
            <p role="alert" className="text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 bg-[#1c1b1a] hover:bg-black text-white rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-[0.2em]">
              {pending ? "Sending…" : "Send booking request"}
            </span>
          </button>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#c9c4bc]">
            <span className="h-px flex-1 bg-[#ede9e2]" />
            <span>or</span>
            <span className="h-px flex-1 bg-[#ede9e2]" />
          </div>

          {/* ── Reservations are also taken by phone ── */}
          <a
            href="tel:+919070090713"
            className="w-full py-4 bg-[#a88956] hover:bg-[#8f7343] text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-[0.2em]">+91 90700 90713</span>
          </a>

          <p className="text-center text-[11px] text-[#7a7771] font-light leading-relaxed px-2">
            Call the front desk with your dates and we will check availability and confirm your booking.
          </p>
        </form>
        )}
      </div>
    </div>
  );
}
