"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import WelcomeSection from "./components/WelcomeSection";
import SuitesSection from "./components/SuitesSection";
import DiningSection from "./components/DiningSection";
import ExperiencesSection from "./components/ExperiencesSection";
import GallerySection from "./components/GallerySection";
import BookingWidget from "./components/BookingWidget";
import Footer from "./components/Footer";

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);

  const handleOpenBooking = (_params?: { suite?: string; checkIn?: string; checkOut?: string; guests?: number; } | string) => {
    setBookingOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#0b131b] text-slate-100 selection:bg-[#c5a059] selection:text-black">
      {/* Navigation Bar */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero Section with Quick Reservation Bar */}
      <HeroSection onOpenBooking={handleOpenBooking} />

      {/* Welcome / Story Section */}
      <WelcomeSection />

      {/* Rooms & Accommodations Showcase */}
      <SuitesSection onOpenBooking={handleOpenBooking} />

      {/* Culinary & Fine Dining Section */}
      <DiningSection onOpenBooking={handleOpenBooking} />

      {/* Curated Riviera Experiences */}
      <ExperiencesSection onOpenBooking={handleOpenBooking} />

      {/* Visual Gallery Lightbox */}
      <GallerySection />

      {/* Luxury Footer */}
      <Footer />

      {/* Reservation panel — mounted only while open so its state resets on close */}
      {bookingOpen && (
        <BookingWidget isOpen onClose={() => setBookingOpen(false)} />
      )}
    </main>
  );
}
