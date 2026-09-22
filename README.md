# Hotel Samci Riviera

The website and property management system (PMS) for **Hotel Samci Riviera**, Srinagar.

- **Public website** (`/`): rooms, dining, gallery and a booking form with live availability and prices.
- **Admin panel** (`/admin`): reservations, front desk, rooms and rates, housekeeping, maintenance, HR and guest records for hotel staff.

Built to the *Hotel PMS Scope of Work* (18 modules).

---

## Contents

1. [Module status](#module-status)
2. [Quick start](#quick-start)
3. [Supabase setup](#supabase-setup)
4. [Environment variables](#environment-variables)
5. [Scripts and tests](#scripts-and-tests)
6. [Project structure](#project-structure)
7. [How it works](#how-it-works)
8. [Security](#security)
9. [Integration endpoints](#integration-endpoints)
10. [Deployment](#deployment)
11. [Before go-live](#before-go-live)
12. [Known gaps](#known-gaps)

---

## Module status

| # | Module | Status |
|---|---|---|
| 1 | Reservations & booking engine | ✅ Done |
| 2 | Front desk (check-in / check-out) | ✅ Done |
| 3 | Rooms, rates & inventory | ✅ Done |
| 5 | Housekeeping | ✅ Done |
| 7 | Billing, invoicing, folio & payments | ✅ Done |
| 8 | Guest CRM & loyalty | ✅ Done |
| 11 | Maintenance / engineering | ✅ Done |
| 12 | HR & staff | ✅ Done |
| 15 | Roles, permissions & administration | ✅ Done |
| 13 | Reports | 🟡 Dashboard and night-audit report only |
| 16 | Notifications | 🟡 Booking messages and editable templates only |
| 17 | Guest booking portal | 🟡 Search, live price and booking request; no online payment or guest accounts |
| 4 | Revenue & dynamic pricing | ⬜ Not started |
| 6 | Point of sale | ⬜ Not started |
| 9 | Channel manager / OTAs | ⬜ Not started |
| 10 | Banquets & events | ⬜ Not started |
| 14 | Multi-property | ⬜ Not started |
| 18 | Mobile apps | ⬜ Not started (key staff screens already work on phones) |

Modules 4, 6, 9, 10, 14 and 18 are the remaining work.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # add your Supabase keys
npm run dev
```

Open <http://localhost:3000>. The public site works without any keys. The admin panel shows a setup notice until Supabase is configured.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Postgres, Auth, Storage, Realtime).

> **Note:** this Next.js version differs from older ones. Read the guide in `node_modules/next/dist/docs/` before changing framework code (see `AGENTS.md`).

---

## Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In the **SQL editor**, run every file in `supabase/migrations/` **in order**, one at a time.
3. Copy the project URL, anon key and service role key (**Project Settings → API**) into `.env.local`.
4. Add the first user under **Authentication → Users** with "Auto Confirm User" ticked. This first account becomes the administrator. Create everyone else from **Staff** in the admin panel.

| Migration | What it adds |
|---|---|
| `0001_init.sql` | Base schema, security policies, tariff |
| `0002_room_photos.sql` | Room photo storage |
| `0003_room_status_and_staff.sql` | Room occupancy, staff details |
| `0004_staff_roles.sql` | Manager and housekeeping roles |
| `0005_foundation.sql` | Roles & permissions, settings, audit log, sign-in tracking |
| `0006_rooms_and_rates.sql` | Room blocks, rate plans, seasons, restrictions, channel allocation, companies |
| `0007_reservations.sql` | Booking statuses, groups, room moves, folio, guest IDs, overbooking guard |
| `0008_front_desk.sql` | Registration cards, ID scans, guest requests, key cards, night audit, message log |
| `0009_housekeeping.sql` | Cleaning tasks, zones, checklist, inspections, DND, lost & found |
| `0010_housekeeping_sow_scope.sql` | Trims housekeeping to the SOW |
| `0011_maintenance.sql` | Tickets, photos, assets, preventive schedules, resolution targets |
| `0012_hr.sql` | HR profiles, shifts, roster, attendance, leave |
| `0013_guest_crm_and_admin.sql` | Guest profiles, feedback, merge & erase; message templates, languages, sessions |
| `0014_billing.sql` | Split folios, GST invoice numbering, gateway payments, refund approval |
| `0015_city_ledger_and_currency.sql` | City ledger (corporate A/R), exchange rates, foreign-currency settlement |
| `0016_loyalty.sql` | Loyalty tiers, points lots, redemption, expiry, tier history |

Migrations upgrade an existing database in place; existing data is kept.

---

## Environment variables

Set these in `.env.local` locally, and in **Vercel → Settings → Environment Variables** for Production and Preview.

| Variable | Needed | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Public Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server-only key: website bookings, staff accounts, feedback page. Never expose it to the browser. |
| `TWO_FACTOR_MODE` | Before go-live | `demo` (default: every code is `123456`) or `totp` (real authenticator apps) |
| `DEMO_2FA_CODE` | No | The demo 2FA code (default `123456`) |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | Optional | Guest and staff emails |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Optional | SMS |
| `DOOR_LOCK_WEBHOOK_URL`, `DOOR_LOCK_API_KEY` | Optional | Electronic key cards |
| `ROOM_CONTROLS_SECRET` | Optional | Do Not Disturb from in-room controls |
| `CRON_SECRET` | Optional | Scheduled maintenance job (escalations, preventive tickets) |
| `ATTENDANCE_API_SECRET` | Optional | Biometric attendance devices |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Optional | Online payment links |
| `RAZORPAY_WEBHOOK_SECRET` | With Razorpay | Signs the webhook. Without it no online payment reaches a folio |

Without an optional key, that feature is skipped. Email, SMS and key-card attempts are still logged as "skipped", so nothing breaks.

---

## Scripts and tests

```bash
npm run dev      # development server
npm run build    # production build
npm start        # serve the production build
npm run lint     # ESLint
npm test         # unit tests (pricing, tax, penalties, room assignment, passwords, HR, templates,
                 #             invoices, city-ledger aging, currency conversion, loyalty points)
```

Database tests apply every migration to a throwaway local Postgres and check behaviour: overbooking,
permissions, housekeeping, maintenance, HR, guest records, invoice immutability, refund approval, city
ledger transfers and credit limits, and loyalty earning, redemption and expiry.

```bash
PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres supabase/tests/run.sh
```

---

## Project structure

```
proxy.ts                   Session refresh and /admin sign-in guard
supabase/migrations/       Database schema, security policies, triggers (run in order)
supabase/tests/            Database behaviour tests
tests/                     Unit tests

app/
├── (site)/                Public website pages
├── feedback/[token]/      Guest feedback form (link in the final bill email)
├── api/                   Integration endpoints (see below)
├── lib/                   Shared logic: auth, permissions, pricing, tax, dates, HR,
│                          notifications, templates, integrations, invoices,
│                          city-ledger, currency, loyalty
└── admin/
    ├── *-actions.ts       Server actions, one file per area
    ├── login/, security/  Sign-in, 2FA, password
    └── (protected)/       Admin pages:
        dashboard, front-desk, bookings, guests (+ loyalty), groups, tape-chart,
        rooms, housekeeping, maintenance, hr, rates, companies, night-audit,
        billing (invoices, refunds, city-ledger, currencies), staff, roles,
        settings, audit
```

---

## How it works

### Reservations and front desk
- **Booking statuses:** Tentative, Confirmed, Checked-In, Checked-Out, Cancelled, No-Show, Waitlisted.
- **Prices** are calculated as: base rate (or weekend rate) → season → rate plan → length-of-stay discount, plus extra adults. The agreed nightly prices are saved on the booking, so later rate changes don't affect it.
- **Overbooking is blocked by the database.** A manager can override it with a reason, which is logged.
- **Website bookings** show live availability and prices. The guest picks a rate plan and sends a request, which is held as *tentative* (or *waitlisted* if full) for the desk to confirm.
- **Check-in** needs an inspected room, government ID, a signed registration card and the deposit.
- **Check-out** settles the bill and can email it.
- **Night audit** posts the night's room charges, marks no-shows, retires expired loyalty points,
re-checks every member's tier, and moves the business date forward.

### Billing and invoicing
- **Folios:** every stay starts with one master bill. The desk can open more — "Company", "Extras" — and move charges between them, so one stay can be billed to more than one payer.
- **Tax invoices** are numbered `INV/2026-27/0001`: sequential per financial year, handed out by the database so two people issuing at once cannot collide, and never reused. An issued invoice cannot be edited or deleted — only cancelled, and the number stays spent.
- The invoice freezes its own lines, totals, rate-wise tax summary and the customer's name and GSTIN, so later changes to the guest record cannot alter a document already given out.
- **Online payments** use Razorpay payment links: the guest pays on Razorpay's page, so no card details reach this application. A folio is credited only when the signed webhook confirms the money arrived — never from the browser.
- **Refunds** at or above the configured threshold need a second person to approve, and never the person who asked. Approving pays out and posts the folio line in one step.

### Housekeeping
- Check-outs create cleaning tasks automatically. Tasks are assigned by floor zone and workload, skipping staff on leave or rostered off.
- Status flow: **Dirty → Cleaning → Clean → Inspected**. Only inspected rooms can be checked into.
- Also included: a linen/amenities/minibar checklist, turnaround targets, deep-clean schedule, Do Not Disturb, and lost & found.

### Maintenance
- Any staff member can raise a ticket for a room, an asset or a place, with photos.
- Priorities are Low, Medium, High and Urgent. Urgent tickets alert the engineering supervisor.
- A ticket can take a room out of order. Resolving the ticket returns the room to sale, marked dirty for housekeeping.
- Each priority has a resolution target; tickets past it are escalated. Assets keep their own history, and preventive schedules raise tickets when due.

### HR
- **Staff profiles:** employee ID, department, shift pattern.
- **Roster:** a weekly grid of shifts.
- **Attendance:** self clock-in (optionally only on site), manual entry by HR, or biometric devices.
- **Leave:** requests and approval.
- **Performance:** summary per staff member.
- **Payroll export:** CSV for payroll software.

### Guests
- **Profiles:** stay history, total spend, preferences, birthday and anniversary.
- **Tags:** VIP and Blacklisted (warned at booking and check-in). Repeat Guest and Corporate are added automatically.
- **Feedback:** requested with the final bill email.
- **Housekeeping of records:** duplicate merging, plus data export and erasure for privacy requests.

### Loyalty
- **Points are held as lots.** Each earning carries its own expiry date and how much of it is left. A
redemption eats the oldest lot first and expiry retires whatever is unused when a lot's date passes — so
the desk can always say which stay a point came from and when it dies, which a single running total
cannot.
- **Earning** happens automatically when an invoice is issued, at the earn rate of the tier the guest
held at the time, on the **taxable value** only: tax collected for the government is not spend with the
hotel. A company-billed invoice earns the company nothing for the guest, and reprinting an invoice never
earns twice.
- **Redeeming** posts a payment to the folio, so points settle a bill exactly as cash does. A redemption
can never exceed the balance, the property's minimum, or what is actually owed.
- **Tiers** (Silver, Gold, Platinum by default, all editable) need both the nights *and* the spend of a
rolling twelve months. Night audit re-checks every member and records each move with its reason.
- Erasing a guest's data removes the membership and its points history; the folio lines a redemption
produced are financial record and stay.

### Administration
- **Roles:** twelve built-in, all editable, and you can add your own. Permissions are set per module and
action — including the city ledger, and loyalty enrolment, corrections and redemption.
- **Audit log:** every change, with before/after values. Entries cannot be edited or deleted.
- **Message templates:** editable per language with placeholders like `{GuestName}`, under **Settings → Edit message templates**.
- **Activity & sessions:** see who is signed in and end someone's sessions, under **Staff → Activity & sessions**.

---

## Security

Access is checked in three layers:
1. `proxy.ts` sends signed-out visitors to the login page.
2. Every page and server action checks the specific permission.
3. Database row-level security checks it again as the final safeguard.

Other protections:
- **2FA** for administrator and finance roles. Anyone can opt in.
- **Passwords:** complexity rules, expiry, and lockout after repeated failures.
- **Auto sign-out** after a period of inactivity.
- **ID scans** are private. Only authorised roles can view them, each view is logged, and scans are deleted after the retention period.

---

## Integration endpoints

| Endpoint | Used by | Auth |
|---|---|---|
| `POST /api/room-controls` | In-room controls (Do Not Disturb) | `Bearer ROOM_CONTROLS_SECRET` |
| `POST /api/attendance` | Biometric attendance devices | `Bearer ATTENDANCE_API_SECRET` |
| `GET /api/cron/maintenance` | Scheduler, every 15–30 min (e.g. Vercel Cron) | `Bearer CRON_SECRET` |
| `POST /api/payments/razorpay/webhook` | Razorpay | `X-Razorpay-Signature` (HMAC, `RAZORPAY_WEBHOOK_SECRET`) |

Each endpoint is disabled until its secret is set. Request formats are documented at the top of each route file.

---

## Deployment

The site is deployed on **Vercel** from `master`. Every pull request gets its own preview deployment.

1. Run any new migrations in Supabase **before** merging.
2. Check the pull request's Vercel preview.
3. Merge to `master`; production deploys automatically.

Set the canonical site address in `app/lib/site.ts` (`SITE.url`). The sitemap, `robots.txt` and email links all use it.

---

## Before go-live

- [ ] Switch 2FA to real mode: `TWO_FACTOR_MODE=totp`
- [ ] Swap Razorpay test keys for live keys, and re-point the webhook at the live site
- [ ] Confirm the invoice prefix and GSTIN with the hotel's accountant before the first invoice is issued
- [ ] Set real exchange rates under **Billing → Currencies** before turning multi-currency on; the seeded
      rates are indicative only
- [ ] Agree the loyalty earn and redemption rates, tier thresholds and points expiry with the owner, then
      turn the programme on under **Guests → Loyalty** (it ships switched off)
- [ ] Set each corporate client's credit limit and payment terms under **Companies**, or the city ledger
      will let an account run up without limit
- [ ] Add the email and SMS keys, then send a test message
- [ ] Connect door locks, if used, and test with the vendor
- [ ] Confirm the Supabase data region is acceptable to the hotel, and name it in the privacy policy
- [ ] Give every staff member their own login (no shared accounts)
- [ ] Remove or confirm the unverified website content below

**Unverified website content** that the owner has not confirmed:
- the footer awards bar
- the street address in `Footer.tsx`
- the "Palace & Resort" branding
- the Dining and Experiences sections, which use stock photos
- the legal pages, which are a first draft for the owner to review

---

## Known gaps

1. **Billing:** guests cannot yet pay on the public site — the desk sends them a payment link (Module 17).
2. **OTA channels:** the room allocation for each channel is stored, but only the website enforces it until the channel manager exists (Module 9).
3. **Single property only** (Module 14).
4. **The staff panel is English only.** Languages apply to guest messages.
5. **Room rates:** the Royal and Presidential Suites need rates from the owner before they can be added under **Rates**.
6. **One lint warning:** `<img>` in the homepage hero.

**Room rates** are managed under **Admin → Rates**. The published tariff is also kept in `app/lib/rates-fallback.ts` as a fallback for the website; keep the two in step.
