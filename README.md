# Hotel Samci Riviera

A Next.js rebuild of the website for **Hotel Samci Riviera**, Srinagar — a hotel on the bank of the Jhelum River, 1.5 km from Dal Lake and Lal Chowk, with 33 Deluxe Rooms, 03 Royal Suites, 02 Presidential Suites, and conference space.

It replaces the hotel's original five-page static site (`hotelsamciriviera.com` — Home / About / Gallery / Tariff / Contact, built in 2022) with a single-page marketing site plus supporting legal routes.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | React 19 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Icons | `lucide-react` |
| Fonts | Cormorant Garamond (serif) + Plus Jakarta Sans (sans), via `next/font/google` |
| Language | TypeScript (strict) |

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

## Project structure

```
app/
├── layout.tsx              Root layout: fonts, site-wide metadata, viewport
├── page.tsx                The single-page site — composes every section
├── globals.css             Tailwind entry + design tokens
├── icon.svg                Favicon (SR monogram)
├── opengraph-image.tsx     1200×630 OG card, generated with next/og
├── sitemap.ts              /sitemap.xml
├── robots.ts               /robots.txt
├── lib/site.ts             Shared constants: URL, contact details, legal date
├── privacy/                ─┐
├── terms/                   ├─ Legal routes linked from the footer
├── accessibility/          ─┘
└── components/
    ├── Navbar.tsx          Fixed header, scroll-aware, mobile drawer
    ├── HeroSection.tsx     Rotating hero + quick reservation bar
    ├── WelcomeSection.tsx  About / property facts
    ├── SuitesSection.tsx   Room cards, rates, detail modal, extra charges
    ├── DiningSection.tsx   ⚠ see "Unverified content" below
    ├── ExperiencesSection.tsx  ⚠ see "Unverified content" below
    ├── GallerySection.tsx  14 real property photos + filterable lightbox
    ├── BookingWidget.tsx   Reservation panel (does not submit anywhere yet)
    ├── BookingModal.tsx    ⚠ currently unused — not imported by anything
    ├── LegalPage.tsx       Shared shell for the three legal routes
    └── Footer.tsx          Contact, links, newsletter form

public/gallery/             1.jpg – 14.jpg, the hotel's own photography
```

## Content and sources

Facts on the site are taken from the hotel's published material and should not be changed without checking with the owner.

- **Rates** come from the published tariff: Premier ₹9,499, Luxury ₹10,799. Extra occupant (over 10) ₹2,200, child without bed ₹1,500, buffet lunch/dinner ₹1,470, child meal (5–10) ₹750.
- **Rates are quoted on the CPAI plan** — accommodation with breakfast — and are inclusive of applicable taxes. Lunch and dinner are charged separately. This is stated on the room cards, the detail modal, and the charges panel; keep all three in sync if rates change.
- **Contact details** (`0194-3500113`, `+91 90700 90713`, `0194-3517164`, `info@hotelsamciriviera.com`) live in `app/lib/site.ts` and in `Footer.tsx`.
- **Photography** in `public/gallery/` is the hotel's own, mirrored from the original site. It is the only genuine imagery in the repo.

## Known gaps

Tracked so nobody rediscovers them:

1. **No contact section.** The original site had a dedicated contact page with a map. There is no `#contact` anchor, map embed, or contact form — only the footer block.
2. **Royal and Presidential Suites are not bookable.** They are named in the About copy, but `ROOMS_DATA` holds only Premier and Luxury. The published tariff prices neither, so rates are needed from the owner.
3. **The booking flow is a dead end.** `BookingWidget` ends on a permanent "Checking Room Availability…" screen with no backend. `BookingModal` is a complete three-step flow that tells guests a confirmation voucher was emailed — it is not imported anywhere, and nothing sends email. Either wire these up or convert them to call-to-book.
4. **Two pre-existing lint errors:** `setState` called synchronously in an effect in `BookingWidget.tsx`, and an `any` cast in `SuitesSection.tsx`.

## Unverified content

Some material on the site does not appear on the hotel's own site and has **not** been confirmed with the owner. Treat it as placeholder:

- **The footer awards bar** — Condé Nast Gold List, Forbes Five-Star, Michelin Red Keys, World Luxury Hotels. None are substantiated. Publishing these as real ratings is a liability; remove or confirm before launch.
- **The street address** in `Footer.tsx` reads "Dal Lake, Boulevard Road, Srinagar 190001". Boulevard Road runs along Dal Lake, which contradicts the hotel's own description of being 1.5 km away on the Jhelum. The source site says only "Srinagar, J&K, India".
- **"Palace & Resort"** branding, and the entire **Dining** and **Experiences** sections (Sheesh Mahal Restaurant, The Riviera Cafe, Shikara cruises, candlelight dining). The hotel's site describes no restaurant or activities. These sections also still use stock Unsplash imagery, as does the hero.
- The **legal pages** are a good-faith first draft written against what the site actually does. They need the owner's review — cancellation terms, check-in times, and smoking/pet policies are deliberately left as "confirmed at time of booking".

## Deployment

Everything prerenders as static content, so any Next.js host will do; Vercel is the path of least resistance.

Set the canonical origin in `app/lib/site.ts` (`SITE.url`) before deploying — `metadataBase`, the sitemap, and `robots.txt` all derive from it.

## Working in this repo

`AGENTS.md` notes that this version of Next.js differs from what may be familiar. Read the relevant guide under `node_modules/next/dist/docs/` before writing code, and heed deprecation notices.
