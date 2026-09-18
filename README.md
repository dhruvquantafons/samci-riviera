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
| Database & auth | Supabase (Postgres + Supabase Auth) |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

Open <http://localhost:3000>. The public site runs without any environment
variables; the admin panel shows a setup notice until Supabase is configured.

### Setting up Supabase

The admin panel at `/admin` needs a Supabase project.

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In the SQL editor, run each file in `supabase/migrations/` **in order**:
   `0001_init.sql` (schema, RLS policies, tariff seed), `0002_room_photos.sql`
   (storage bucket for room photography), then
   `0003_room_status_and_staff.sql` (room occupancy triggers, staff details).
   Then `0004_staff_roles.sql` (manager and housekeeping roles).
3. Copy the URL, anon key, and service role key from **Project Settings → API**
   into `.env.local` (see `.env.example`).
4. Add your **first** user under **Authentication → Users**, ticking "Auto
   Confirm User". That first account automatically becomes an administrator.
   Everyone after that is created from **Staff** inside the panel — the
   Supabase dashboard is not needed again.

On Vercel, set the same three variables under **Settings → Environment
Variables**. `SUPABASE_SERVICE_ROLE_KEY` bypasses row level security — keep it
server-side only and never expose it to the browser.

Other scripts:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

## Project structure

```
proxy.ts                    Session refresh + /admin route guard
                            (Next 16 renamed `middleware` to `proxy`)
supabase/migrations/        Schema, RLS policies and tariff seed

app/
├── page.tsx                Server component: loads rates, renders HomeShell
├── layout.tsx              Root layout: fonts, site-wide metadata, viewport
├── globals.css             Tailwind entry + design tokens
├── icon.svg                Favicon (SR monogram)
├── opengraph-image.tsx     1200×630 OG card, generated with next/og
├── sitemap.ts / robots.ts
├── privacy/ terms/ accessibility/   Legal routes linked from the footer
│
├── lib/
│   ├── site.ts             Name, URL, contact details, legal date
│   ├── types.ts            Database row types and display labels
│   ├── auth.ts             getStaff / requireStaff / requireAdmin
│   ├── rates.ts            Public tariff reader (falls back if unconfigured)
│   ├── rates-fallback.ts   The published tariff, hardcoded
│   ├── booking-request.ts  Accepts website enquiries (service role)
│   └── supabase/           server / client / public clients + config check
│
├── components/             Public marketing site
│   ├── HomeShell.tsx       Client shell holding the booking panel state
│   ├── SuitesSection.tsx   Room cards + charges, driven by live rates
│   ├── BookingWidget.tsx   Enquiry form + phone fallback
│   └── …                   Navbar, Hero, Welcome, Dining, Experiences,
│                           Gallery, Footer, LegalPage
│
└── admin/                  Reservations desk
    ├── actions.ts          Every mutation, each re-checking authorization
    ├── login/              Sign-in (outside the guarded layout)
    ├── components/         Sidebar, shared UI, setup notice
    └── (protected)/        Route group wrapped by the auth guard
        ├── page.tsx        Dashboard: movements, occupancy, revenue, alerts
        ├── bookings/       Inbox, filters, detail, notes, manual entry
        ├── rooms/          Inventory + month availability calendar
        ├── rates/          Tariff and room photos (admin only)
        └── staff/          Details, roles and access (admin only)

public/gallery/             1.jpg – 14.jpg, the hotel's own photography
```

## How booking works

Reservations arrive two ways, both landing in the same inbox:

- **Website** — the booking panel posts to `submitBookingRequest`, which writes
  a row with status `new` and source `website`. It runs with the service role
  key because the visitor is anonymous, and RLS deliberately forbids the anon
  key from writing bookings. Status and source are fixed server-side so a
  crafted request cannot mark itself confirmed.
- **Manually** — staff log phone, email and walk-in bookings at
  `/admin/bookings/new`. An existing guest with a matching email or phone is
  linked automatically rather than duplicated.

Availability is derived, not stored: a booking occupies a night when
`check_in <= night < check_out`, counted against the rooms in inventory. Only
`new`, `confirmed` and `checked_in` bookings count. The Rooms page shows this
as a month calendar you can page through.

**Room status is automatic.** A database trigger (`sync_room_status`) marks a
room `occupied` when a booking with that room assigned is checked in, and
releases it on check-out, cancellation or reassignment. It lives in Postgres
rather than the app so the rule holds however a booking is changed. It only
ever releases a room it had marked `occupied`, so a `maintenance` or
`out_of_service` hold set by a person is never overwritten.

There is no guest CRM section. The `guests` table still exists and bookings are
still linked to a guest record — matching on email or phone so repeat visitors
are not duplicated — but there is no UI for browsing it.

## Roles

A role is a permission tier. Someone's actual job — Waiter, Head Chef, Night
Manager — goes in their free-text **job title**, so the tiers stay few and
meaningful.

| | Dashboard | Bookings | Room status | Inventory & rates | Staff accounts |
|---|---|---|---|---|---|
| **Administrator** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ✅ | ✅ | — |
| **Front Desk** | ✅ | ✅ | ✅ | — | — |
| **Housekeeping** | ✅ | — | ✅ | — | — |

Administrators add staff from **Staff → Add a staff member**: name, job title,
email, a temporary password and a role. The account is confirmed immediately,
so there is no invitation email to chase — hand the password over directly.
Administrators can also set a new password or remove an account from the same
page. Suspending is usually better than removing, because it keeps the person's
notes attributed to them.

An administrator cannot change their own role or access, which prevents
locking the whole team out.

Enforced in four places: `proxy.ts` redirects signed-out traffic, the
`(protected)` layout re-checks with `requireStaff()`, every server action calls
the guard for its tier (`requireAdmin`, `requireRatesAccess`,
`requireBookingsAccess`), and Postgres RLS is the final backstop through
`is_admin()`, `can_manage_rates()` and `can_manage_bookings()`. A missed check
in the app still cannot leak data.

Creating, deleting and re-passwording accounts uses the Supabase admin API via
`createAdminClient()`, which holds the service role key. It is server-only and
every caller re-checks that the requester is an administrator.

## Content and sources

Facts on the site are taken from the hotel's published material and should not be changed without checking with the owner.

- **Rates** now live in the database and are edited at `/admin/rates`. The published tariff (Premier ₹9,499, Luxury ₹10,799, extra occupant ₹2,200, child without bed ₹1,500, buffet ₹1,470, child meal ₹750) is seeded by the migration and duplicated in `app/lib/rates-fallback.ts`, which serves the public site if Supabase is unreachable. Keep the two in step.
- **Rates are quoted on the CPAI plan** — accommodation with breakfast — and are inclusive of applicable taxes. Lunch and dinner are charged separately. This is stated on the room cards, the detail modal, the charges panel, and the admin rates page.
- **Contact details** (`0194-3500113`, `+91 90700 90713`, `0194-3517164`, `info@hotelsamciriviera.com`) live in `app/lib/site.ts` and in `Footer.tsx`.
- **Photography** in `public/gallery/` is the hotel's own, mirrored from the original site. It is the only genuine imagery in the repo. Room photographs can be replaced from `/admin/rates`, which uploads to the `room-photos` Supabase Storage bucket and points the room type at the new public URL.

## Known gaps

Tracked so nobody rediscovers them:

1. **No contact section.** The original site had a dedicated contact page with a
   map. There is no `#contact` anchor, map embed, or contact form — only the
   footer block.
2. **Royal and Presidential Suites are not bookable.** They are named in the
   About copy, but only Premier and Luxury exist as room types. The published
   tariff prices neither, so rates are needed from the owner. Once known, add
   them at `/admin/rates` — no code change required.
3. **No email notifications.** A website enquiry lands in the inbox, but nobody
   is told. Someone has to watch `/admin`. Wiring an email on insert (Supabase
   database webhook, or Resend from the server action) is the obvious next step.
4. **No guest-facing confirmation email.** The panel says the desk will confirm,
   which is accurate today, but a written acknowledgement is expected of a hotel.
5. **Availability does not block overbooking.** The grid shows committed
   occupancy, but nothing prevents accepting a booking beyond capacity — by
   design, since the desk often oversells deliberately. Add a check if wanted.
6. **Manual room status can drift.** Setting a room to `available` by hand while
   a guest is checked into it is not corrected — the trigger only reacts to
   booking changes. The Occupant column on the inventory table makes any
   mismatch visible.
7. **Seven lint warnings remain**, all pre-existing: unused icon imports and
   `<img>` instead of `<Image>` in the Dining, Experiences and Hero sections.

## Data protection

The admin panel stores guest personal data — names, phone numbers, email
addresses and stay history. Before this handles real guests:

- Confirm the Supabase project's region and retention are acceptable to the
  hotel, and note them in the privacy policy, which currently describes
  intent rather than a specific processor.
- Give each staff member their own login. Shared accounts make access
  impossible to revoke or attribute.
- Suspend accounts from **Staff** when someone leaves; the row-level policies
  read `is_active`, so access stops immediately.

## Unverified content

Some material on the site does not appear on the hotel's own site and has **not** been confirmed with the owner. Treat it as placeholder:

- **The footer awards bar** — Condé Nast Gold List, Forbes Five-Star, Michelin Red Keys, World Luxury Hotels. None are substantiated. Publishing these as real ratings is a liability; remove or confirm before launch.
- **The street address** in `Footer.tsx` reads "Dal Lake, Boulevard Road, Srinagar 190001". Boulevard Road runs along Dal Lake, which contradicts the hotel's own description of being 1.5 km away on the Jhelum. The source site says only "Srinagar, J&K, India".
- **"Palace & Resort"** branding, and the entire **Dining** and **Experiences** sections (Sheesh Mahal Restaurant, The Riviera Cafe, Shikara cruises, candlelight dining). The hotel's site describes no restaurant or activities. These sections also still use stock Unsplash imagery, as does the hero.
- The **legal pages** are a good-faith first draft written against what the site actually does. They need the owner's review — cancellation terms, check-in times, and smoking/pet policies are deliberately left as "confirmed at time of booking".

## Deployment

The marketing pages prerender as static content; everything under `/admin` is
server-rendered on demand. Any Next.js host will do; Vercel is the path of
least resistance.

Before deploying:

- Set the canonical origin in `app/lib/site.ts` (`SITE.url`) — `metadataBase`,
  the sitemap and `robots.txt` all derive from it.
- Set the three Supabase variables. Without them the site still builds and
  serves the fallback tariff, and `/admin` shows a setup notice instead of
  failing.
- `/admin` is excluded from search indexing via route metadata.

## Working in this repo

`AGENTS.md` notes that this version of Next.js differs from what may be familiar. Read the relevant guide under `node_modules/next/dist/docs/` before writing code, and heed deprecation notices.
