/**
 * Single source of truth for site-wide constants that appear in metadata,
 * structured data, the sitemap, and the legal pages.
 */
export const SITE = {
  name: "Hotel Samci Riviera",
  shortName: "Samci Riviera",
  tagline: "Luxury Hotel & Dining • Srinagar",
  url: "https://www.hotelsamciriviera.com",
  description:
    "Hotel Samci Riviera is situated at a prime location in Srinagar, on the bank of the Jhelum River and just 1.5 km from Dal Lake and Lal Chowk — with 33 Deluxe Rooms, 03 Royal Suites, 02 Presidential Suites, and versatile conference space.",
  email: "info@hotelsamciriviera.com",
  phones: ["0194-3500113", "+91 90700 90713", "0194-3517164"],
  addressLocality: "Srinagar",
  addressRegion: "Jammu & Kashmir",
  addressCountry: "India",
} as const;

/** Last review date shown on the legal pages. */
export const LEGAL_LAST_UPDATED = "16 September 2026";
