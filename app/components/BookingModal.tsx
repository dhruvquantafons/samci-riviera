"use client";

import { useState } from "react";
import { X, Calendar, Users, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, ChevronLeft } from "lucide-react";
import { SUITES_DATA } from "./SuitesSection";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSuite?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  initialSuite,
  initialCheckIn = "2026-10-15",
  initialCheckOut = "2026-10-18",
  initialGuests = 2,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedSuiteName, setSelectedSuiteName] = useState(
    initialSuite || "Executive Deluxe Room"
  );
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  // Add-ons
  const [addons, setAddons] = useState({
    boatTransfer: true,
    sunsetDinner: false,
    spaPackage: false,
  });

  // Guest details
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [bookingRef, setBookingRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSuite =
    SUITES_DATA.find((s) => s.name === selectedSuiteName) || SUITES_DATA[0];

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePrice = currentSuite.price * nights;
  const boatCost = addons.boatTransfer ? 45 : 0;
  const dinnerCost = addons.sunsetDinner ? 75 : 0;
  const airportCost = addons.spaPackage ? 30 : 0;

  const subtotal = basePrice + boatCost + dinnerCost + airportCost;
  const taxes = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + taxes;

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = "SAMCI-" + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#f9f8f5] max-w-3xl w-full rounded-2xl overflow-hidden border border-[#e5e0d8] shadow-2xl relative my-8 text-[#1c1b1a]">
        {/* Modal Header */}
        <div className="bg-white p-5 sm:p-6 border-b border-[#e5e0d8] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#a88956] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RESERVATION ENGINE</span>
            </div>
            <h3 className="font-serif text-2xl text-[#1c1b1a] font-medium mt-0.5">
              {bookingRef ? "Reservation Confirmed" : "Book Your Stay at Samci Riviera"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7a7771] hover:text-[#1c1b1a] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        {!bookingRef && (
          <div className="grid grid-cols-2 bg-[#f5f3ef] border-b border-[#e5e0d8] text-xs uppercase tracking-widest">
            <button
              onClick={() => setStep(1)}
              className={`py-3 text-center font-medium transition-colors cursor-pointer ${
                step === 1 ? "text-[#1c1b1a] border-b-2 border-[#1c1b1a] bg-white font-semibold" : "text-[#7a7771]"
              }`}
            >
              1. Dates & Room Selection
            </button>
            <button
              onClick={() => setStep(2)}
              className={`py-3 text-center font-medium transition-colors cursor-pointer ${
                step === 2 ? "text-[#1c1b1a] border-b-2 border-[#1c1b1a] bg-white font-semibold" : "text-[#7a7771]"
              }`}
            >
              2. Add-ons & Guest Details
            </button>
          </div>
        )}

        {/* Step 1: Dates & Room Selection */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#7a7771] font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#a88956]" /> Check-In Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-white border border-[#e5e0d8] text-xs text-[#1c1b1a] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#a88956] w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#7a7771] font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#a88956]" /> Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-white border border-[#e5e0d8] text-xs text-[#1c1b1a] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#a88956] w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#7a7771] font-medium flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#a88956]" /> Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="bg-white border border-[#e5e0d8] text-xs text-[#1c1b1a] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#a88956] w-full"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                </select>
              </div>
            </div>

            {/* Choose Room */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-[#a88956] font-semibold">
                Select Room Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUITES_DATA.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedSuiteName(room.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedSuiteName === room.name
                        ? "bg-white border-[#1c1b1a] shadow-md"
                        : "bg-white/60 border-[#e5e0d8] hover:border-[#a88956]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-lg text-[#1c1b1a] font-medium">{room.name}</h4>
                      <span className="font-serif text-[#a88956] font-bold">${room.price}</span>
                    </div>
                    <p className="text-[11px] text-[#7a7771] font-light mt-1 line-clamp-1">{room.tagline}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary Preview */}
            <div className="p-4 rounded-xl bg-white border border-[#e5e0d8] flex justify-between items-center text-xs">
              <div>
                <span className="text-[#7a7771]">Duration: </span>
                <strong className="text-[#1c1b1a]">{nights} Night(s)</strong>
                <span className="text-[#7a7771] ml-2">Selected: </span>
                <strong className="text-[#a88956]">{currentSuite.name}</strong>
              </div>
              <div className="font-serif text-xl text-[#1c1b1a] font-bold">
                ${basePrice} <span className="text-xs text-[#7a7771] font-normal">est.</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] font-semibold text-xs uppercase tracking-widest rounded-full flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Continue to Guest Details & Add-ons</span>
              <ArrowRight className="w-4 h-4 text-[#1c1b1a]" />
            </button>
          </div>
        )}

        {/* Step 2: Add-ons & Guest Form */}
        {step === 2 && !bookingRef && (
          <form onSubmit={handleCompleteBooking} className="p-6 sm:p-8 space-y-6">
            {/* Add-ons */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-[#a88956] font-semibold">
                Enhance Your Stay (Optional Add-ons)
              </h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e5e0d8] cursor-pointer hover:border-[#a88956]">
                  <div className="flex items-center space-x-3 text-xs">
                    <input
                      type="checkbox"
                      checked={addons.boatTransfer}
                      onChange={(e) => setAddons({ ...addons, boatTransfer: e.target.checked })}
                      className="accent-[#a88956] w-4 h-4"
                    />
                    <span className="text-[#1c1b1a]">Sunset Shikara Cruise on Dal Lake</span>
                  </div>
                  <span className="text-xs font-serif text-[#a88956] font-bold">+$45</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e5e0d8] cursor-pointer hover:border-[#a88956]">
                  <div className="flex items-center space-x-3 text-xs">
                    <input
                      type="checkbox"
                      checked={addons.sunsetDinner}
                      onChange={(e) => setAddons({ ...addons, sunsetDinner: e.target.checked })}
                      className="accent-[#a88956] w-4 h-4"
                    />
                    <span className="text-[#1c1b1a]">Traditional Kashmiri Wazwan Feast Experience</span>
                  </div>
                  <span className="text-xs font-serif text-[#a88956] font-bold">+$75</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e5e0d8] cursor-pointer hover:border-[#a88956]">
                  <div className="flex items-center space-x-3 text-xs">
                    <input
                      type="checkbox"
                      checked={addons.spaPackage}
                      onChange={(e) => setAddons({ ...addons, spaPackage: e.target.checked })}
                      className="accent-[#a88956] w-4 h-4"
                    />
                    <span className="text-[#1c1b1a]">Private Srinagar Airport Pick-up & Drop</span>
                  </div>
                  <span className="text-xs font-serif text-[#a88956] font-bold">+$30</span>
                </label>
              </div>
            </div>

            {/* Guest Form Input */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-[#a88956] font-semibold">
                Guest Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="bg-white border border-[#e5e0d8] text-xs text-[#1c1b1a] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#a88956]"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="bg-white border border-[#e5e0d8] text-xs text-[#1c1b1a] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#a88956]"
                />
                <input
                  type="tel"
                  placeholder="Telephone Number *"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="bg-white border border-[#e5e0d8] text-xs text-[#1c1b1a] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#a88956]"
                />
                <input
                  type="text"
                  placeholder="Special Dietary or Room Requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="bg-white border border-[#e5e0d8] text-xs text-[#1c1b1a] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#a88956]"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-white border border-[#e5e0d8] space-y-2 text-xs">
              <div className="flex justify-between text-[#5a5854]">
                <span>{currentSuite.name} ({nights} Nights):</span>
                <span>${basePrice}</span>
              </div>
              {subtotal > basePrice && (
                <div className="flex justify-between text-[#5a5854]">
                  <span>Selected Add-ons:</span>
                  <span>+${subtotal - basePrice}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7a7771]">
                <span>Taxes & Service Levy (12%):</span>
                <span>${taxes}</span>
              </div>
              <div className="border-t border-[#e5e0d8] pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-[#1c1b1a]">Total Amount:</span>
                <span className="font-serif text-2xl text-[#1c1b1a]">${grandTotal}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 text-xs uppercase tracking-widest text-[#7a7771] hover:text-[#1c1b1a] flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] font-semibold text-xs uppercase tracking-widest rounded-full shadow-md text-center cursor-pointer transition-colors"
              >
                Confirm Reservation
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation Banner */}
        {bookingRef && (
          <div className="p-8 text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-[#a88956]/15 border border-[#a88956] flex items-center justify-center mx-auto text-[#a88956]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#a88956] font-semibold">
                WE LOOK FORWARD TO WELCOMING YOU
              </span>
              <h3 className="font-serif text-3xl text-[#1c1b1a] font-medium mt-1">
                Your Room Has Been Reserved
              </h3>
              <p className="text-xs text-[#5a5854] mt-2 max-w-md mx-auto">
                A confirmation voucher and check-in details have been sent to <strong>{guestEmail || "your email address"}</strong>.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-white border border-[#e5e0d8] text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-[#e5e0d8] pb-2">
                <span className="text-[#7a7771]">Confirmation Code:</span>
                <span className="font-mono text-[#a88956] font-bold">{bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a7771]">Room:</span>
                <span className="text-[#1c1b1a] font-medium">{selectedSuiteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a7771]">Check-In:</span>
                <span className="text-[#1c1b1a]">{checkIn} (From 2:00 PM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a7771]">Check-Out:</span>
                <span className="text-[#1c1b1a]">{checkOut} (Until 12:00 PM)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#e5e0d8] font-bold">
                <span className="text-[#1c1b1a]">Total:</span>
                <span className="font-serif text-base text-[#1c1b1a]">${grandTotal}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-[#7a7771]">
              <ShieldCheck className="w-4 h-4 text-[#a88956]" />
              <span>Complimentary Wi-Fi & Breakfast Included</span>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#e6d7c3] hover:bg-[#d9c3a3] text-[#1c1b1a] font-semibold text-xs uppercase tracking-widest rounded-full shadow-md cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
