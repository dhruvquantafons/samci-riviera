"use client";

import { Compass, Sunset, Music, Sparkles, ChevronRight } from "lucide-react";

interface ExperiencesSectionProps {
  onOpenBooking: () => void;
}

export default function ExperiencesSection({ onOpenBooking }: ExperiencesSectionProps) {
  const experiences = [
    {
      title: "Royal Sunset Shikara Cruise",
      category: "Lakeside Excursion",
      icon: Sunset,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
      desc: "Glide effortlessly across golden waters at sunset aboard our hand-crafted mahogany ceremonial Shikara with chilled vintage champagne and gourmet Kashmiri canapés.",
    },
    {
      title: "Private Waterfront Candlelight Dinner",
      category: "Romantic Dining",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2070&auto=format&fit=crop",
      desc: "An exclusive dining table setup on a private floating pier on Dal Lake surrounded by 1,000 flickering candles, personal butler, and custom 6-course Wazwan degustation menu.",
    },
    {
      title: "Kashmiri Sufi & Rabab Music Soirée",
      category: "Heritage Arts",
      icon: Music,
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop",
      desc: "Enchanting evening performances of traditional Rouff dance, Sufi poetry, and soulful Santour & Rabab recitals under the star-lit Himalayan sky.",
    },
    {
      title: "Pari Mahal & Vintage Car Sightseeing Tour",
      category: "Exclusive Sightseeing",
      icon: Compass,
      image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2070&auto=format&fit=crop",
      desc: "Explore Srinagar's royal Pari Mahal, Nishat Bagh terraced gardens, and silver artisan guilds in a restored 1930s vintage Rolls-Royce driven by your private guide.",
    },
  ];

  return (
    <section id="experiences" className="py-24 bg-[#141312] border-t border-white/5 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#e6d7c3] font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>EXPERIENCES</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
            Discover <span className="italic font-normal text-[#e6d7c3]">More</span>
          </h2>
          <p className="text-stone-300 text-sm font-light tracking-wide mt-4">
            From relaxing by the lake to exploring local mountain peaks and cultural heritage, we offer a range of curated experiences to make your stay truly special.
          </p>
        </div>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp, idx) => {
            const IconComp = exp.icon;
            return (
              <div
                key={idx}
                className="bg-[#1f1e1d] rounded-xl overflow-hidden border border-white/10 hover:border-[#e6d7c3]/40 transition-all duration-500 group flex flex-col justify-between shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-[0.9]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f1e1d] via-transparent to-black/40" />

                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-[#e6d7c3] font-medium border border-white/20 flex items-center gap-1.5">
                      <IconComp className="w-3 h-3 text-[#e6d7c3]" />
                      <span>{exp.category}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-serif text-xl text-white font-medium group-hover:text-[#e6d7c3] transition-colors leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-stone-300 font-light leading-relaxed">
                      {exp.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={onOpenBooking}
                    className="w-full py-2.5 text-xs uppercase tracking-widest text-[#1c1b1a] bg-[#e6d7c3] hover:bg-[#d9c3a3] font-semibold rounded-full transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Reserve Activity</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#1c1b1a]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
