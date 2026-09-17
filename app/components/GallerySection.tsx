"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "./Reveal";

type GalleryImage = {
  src: string;
  title: string;
  category: "hotel" | "rooms" | "bathrooms" | "events";
};

// Photography of the actual property, sourced from hotelsamciriviera.com
const GALLERY_IMAGES: GalleryImage[] = [
  { src: "/gallery/1.jpg", title: "Hotel Facade & Reception Entrance", category: "hotel" },
  { src: "/gallery/8.jpg", title: "Reception Lobby & Front Desk", category: "hotel" },
  { src: "/gallery/2.jpg", title: "Twin-Bed Room with Mini Bar & Tea Station", category: "rooms" },
  { src: "/gallery/3.jpg", title: "Twin-Bed Room with Lounge Seating", category: "rooms" },
  { src: "/gallery/4.jpg", title: "Guest Room with LED TV & Sofa", category: "rooms" },
  { src: "/gallery/7.jpg", title: "King Room with Wood Panelling", category: "rooms" },
  { src: "/gallery/11.jpg", title: "King Room with Feature Wall", category: "rooms" },
  { src: "/gallery/12.jpg", title: "Suite Bedroom & Living Area", category: "rooms" },
  { src: "/gallery/13.jpg", title: "Suite with Lounge Seating", category: "rooms" },
  { src: "/gallery/5.jpg", title: "En-Suite Bathroom with Walk-In Shower", category: "bathrooms" },
  { src: "/gallery/6.jpg", title: "Marble Bathroom & Rain Shower", category: "bathrooms" },
  { src: "/gallery/14.jpg", title: "En-Suite Vanity & Shower Cubicle", category: "bathrooms" },
  { src: "/gallery/9.jpg", title: "Conference Hall, U-Shape Seating", category: "events" },
  { src: "/gallery/10.jpg", title: "Banquet & Residential Conference Setup", category: "events" },
];

const FILTERS = [
  { id: "all", label: "All Photos" },
  { id: "hotel", label: "Hotel & Lobby" },
  { id: "rooms", label: "Rooms & Suites" },
  { id: "bathrooms", label: "Bathrooms" },
  { id: "events", label: "Conference & Events" },
] as const;

const CATEGORY_LABELS: Record<GalleryImage["category"], string> = {
  hotel: "Hotel & Lobby",
  rooms: "Rooms & Suites",
  bathrooms: "Bathrooms",
  events: "Conference & Events",
};

export default function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    activeFilter === "all"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === activeFilter);

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i - 1 + filteredImages.length) % filteredImages.length));
  }, [filteredImages.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i + 1) % filteredImages.length));
  }, [filteredImages.length]);

  // Keyboard navigation + scroll lock while the lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, showPrev, showNext]);

  const lightboxImage = lightboxIndex === null ? null : filteredImages[lightboxIndex];

  return (
    <section id="gallery" className="py-24 bg-[#f9f8f5] text-[#1c1b1a] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#a88956] font-semibold mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>GALLERY</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1c1b1a] leading-tight">
            Moments Worth <span className="italic text-[#a88956] font-normal">Remembering</span>
          </h2>
          <p className="text-[#5a5854] text-sm font-light tracking-wide mt-4">
A look inside the hotel.
          </p>
        </Reveal>

        {/* Filters */}
        <div className="flex items-center justify-center space-x-3 mb-10 flex-wrap gap-y-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setLightboxIndex(null);
              }}
              aria-pressed={activeFilter === filter.id}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest font-medium rounded-full transition-all duration-300 cursor-pointer ${
                activeFilter === filter.id
                  ? "bg-[#e6d7c3] text-[#1c1b1a] font-semibold shadow-sm"
                  : "bg-white text-[#5a5854] border border-[#e5e0d8] hover:border-[#a88956]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img, idx) => (
            <Reveal key={img.src} delay={(idx % 3) * 90}>
            <button
              type="button"
              onClick={() => setLightboxIndex(idx)}
              aria-label={`View ${img.title} full size`}
              className="relative w-full h-72 rounded-xl overflow-hidden border border-[#e5e0d8] shadow-sm group cursor-pointer text-left hover-lift"
            >
              <Image
                src={img.src}
                alt={img.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.12] transition-transform duration-[900ms] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] uppercase tracking-widest text-[#e6d7c3] font-semibold">
                  {CATEGORY_LABELS[img.category]}
                </span>
                <h3 className="font-serif text-xl text-white font-medium flex items-center justify-between gap-3">
                  <span>{img.title}</span>
                  <Maximize2 className="w-4 h-4 text-[#e6d7c3] shrink-0" />
                </h3>
              </div>
            </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.title}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
        >
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close gallery"
            className="absolute top-6 right-6 text-slate-300 hover:text-white p-2 z-10 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={showPrev}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-6 text-slate-300 hover:text-white p-2 z-10 cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={showNext}
            aria-label="Next photo"
            className="absolute right-2 sm:right-6 text-slate-300 hover:text-white p-2 z-10 cursor-pointer"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <div key={lightboxImage.src} className="relative w-full h-[70vh] animate-scale-in">
              <Image
                src={lightboxImage.src}
                alt={lightboxImage.title}
                fill
                sizes="100vw"
                className="object-contain rounded"
                priority
              />
            </div>
            <div className="text-center mt-4 space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                {CATEGORY_LABELS[lightboxImage.category]}
              </span>
              <h3 className="font-serif text-2xl text-white font-medium">
                {lightboxImage.title}
              </h3>
              <p className="text-[11px] text-slate-400 tracking-wider">
                {(lightboxIndex ?? 0) + 1} / {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
