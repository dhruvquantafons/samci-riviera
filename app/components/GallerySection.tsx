"use client";

import { useState } from "react";
import { Camera, X, Maximize2, Sparkles } from "lucide-react";

export default function GallerySection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; category: string } | null>(null);

  const images = [
    {
      src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
      title: "Royal Exterior at Dusk",
      category: "palace",
    },
    {
      src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
      title: "Imperial Grand Lobby & Courtyard",
      category: "palace",
    },
    {
      src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop",
      title: "Executive Deluxe River View Room",
      category: "rooms",
    },
    {
      src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop",
      title: "Super Deluxe Bedroom Interior",
      category: "rooms",
    },
    {
      src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
      title: "Sheesh Mahal Waterfront Dining",
      category: "dining",
    },
    {
      src: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=2070&auto=format&fit=crop",
      title: "Traditional Kashmiri Kahwa & High Tea",
      category: "dining",
    },
  ];

  const filteredImages = activeFilter === "all" ? images : images.filter((img) => img.category === activeFilter);

  return (
    <section id="gallery" className="py-24 bg-[#f9f8f5] text-[#1c1b1a] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#a88956] font-semibold mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>GALLERY</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1c1b1a] leading-tight">
            Moments Worth <span className="italic text-[#a88956] font-normal">Remembering</span>
          </h2>
          <p className="text-[#5a5854] text-sm font-light tracking-wide mt-4">
            A glimpse into the imperial luxury, serene waters, and refined craftsmanship of Samci Riviera.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-center space-x-3 mb-10 flex-wrap gap-y-2">
          {[
            { id: "all", label: "All Showcase" },
            { id: "palace", label: "Palace & Grounds" },
            { id: "rooms", label: "Rooms & Comfort" },
            { id: "dining", label: "Dining & Venues" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest font-medium rounded-full transition-all duration-300 ${
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
            <div
              key={idx}
              onClick={() => setLightboxImage(img)}
              className="relative h-72 rounded-xl overflow-hidden border border-[#e5e0d8] shadow-sm hover:shadow-md group cursor-pointer"
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter contrast-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] uppercase tracking-widest text-[#e6d7c3] font-semibold">
                  {img.category}
                </span>
                <h3 className="font-serif text-xl text-white font-medium flex items-center justify-between">
                  <span>{img.title}</span>
                  <Maximize2 className="w-4 h-4 text-[#e6d7c3]" />
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-slate-300 hover:text-white p-2 text-2xl z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded border border-amber-500/30 shadow-2xl"
            />
            <div className="text-center mt-4 space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                {lightboxImage.category}
              </span>
              <h3 className="font-serif text-2xl text-white font-medium">
                {lightboxImage.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
