"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import WelcomeSection from "./WelcomeSection";
import SuitesSection from "./SuitesSection";
import DiningSection from "./DiningSection";
import ExperiencesSection from "./ExperiencesSection";
import GallerySection from "./GallerySection";
import BookingWidget from "./BookingWidget";
import Footer from "./Footer";
import type { RoomType, ExtraCharge } from "../lib/types";

export default function HomeShell({
  rooms,
  charges,
}: {
  rooms: RoomType[];
  charges: ExtraCharge[];
}) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<string>("");

  const handleOpenBooking = (roomName?: string) => {
    setPreselectedRoom(typeof roomName === "string" ? roomName : "");
    setBookingOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#0b131b] text-slate-100 selection:bg-[#c5a059] selection:text-black">
      <Navbar onOpenBooking={handleOpenBooking} />
      <HeroSection onOpenBooking={handleOpenBooking} rooms={rooms} />
      <WelcomeSection />
      <SuitesSection onOpenBooking={handleOpenBooking} rooms={rooms} charges={charges} />
      <DiningSection onOpenBooking={handleOpenBooking} />
      <ExperiencesSection onOpenBooking={handleOpenBooking} />
      <GallerySection />
      <Footer rooms={rooms} />

      {/* Mounted only while open so its state resets on close */}
      {bookingOpen && (
        <BookingWidget
          isOpen
          onClose={() => setBookingOpen(false)}
          roomTypes={rooms}
          preselectedRoom={preselectedRoom}
        />
      )}
    </main>
  );
}
