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
2. In the SQL editor, run each file in `supabase/migrations/` **in order**,
   each as its own run:
   | File | Adds |
   |---|---|
   | `0001_init.sql` | Schema, RLS policies, tariff seed |
   | `0002_room_photos.sql` | Storage bucket for room photography |
   | `0003_room_status_and_staff.sql` | Room occupancy triggers, staff details |
   | `0004_staff_roles.sql` | Manager and housekeeping roles |
   | `0005_foundation.sql` | Configurable roles & permissions, property settings, audit log, sign-in tracking |
   | `0006_rooms_and_rates.sql` | Room attributes, housekeeping status, room blocks, rate plans, seasons, restrictions, channel allocation, companies |
   | `0007_reservations.sql` | New statuses/sources, groups, room moves, folio, guest identities, the overbooking guard |
   | `0008_front_desk.sql` | Registration cards, private ID-document bucket, guest requests, key cards, night audit, notifications |
   | `0009_housekeeping.sql` | Cleaning tasks, zones, checklist, inspections, DND, deep-clean schedule, lost & found |
   | `0010_housekeeping_sow_scope.sql` | Trims housekeeping to the SOW: tasks from check-outs and deep cleans only |
   | `0011_maintenance.sql` | Maintenance tickets, photos bucket, assets, preventive schedules, resolution targets, automatic room block/unblock |
   | `0012_hr.sql` | HR profile fields, departments, shift types, roster, attendance and clock-in, leave, staff feedback |
   | `0013_guest_crm_and_admin.sql` | Guest profile fields, stay statistics, feedback, merge and erase; message templates, languages, ending sessions |

   0005–0008 upgrade an existing database in place: `new` bookings become
   `tentative`, `maintenance` rooms become `out_of_order` with an open-ended
   block, and staff keep their roles.
   In **Authentication → Multi-Factor**, make sure TOTP is enabled (it is by
   default) so staff can set up two-factor authentication.
3. Copy the URL, anon key, and service role key from **Project Settings → API**
   into `.env.local` (see `.env.example`).
4. Add your **first** user under **Authentication → Users**, ticking "Auto
   Confirm User". That first account automatically becomes an administrator.
   Everyone after that is created from **Staff** inside the panel — the
   Supabase dashboard is not needed again.

On Vercel, set the same variables under **Settings → Environment
Variables** (plus the optional integration keys below). `SUPABASE_SERVICE_ROLE_KEY` bypasses row level security — keep it
server-side only and never expose it to the browser.

Other scripts:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
npm test        # unit tests: pricing, tax, penalties, room assignment, passwords, HR, templates
supabase/tests/run.sh   # migrations + database behaviour against a local Postgres
```

## Project structure

```
proxy.ts                    Session refresh + /admin route guard
supabase/migrations/        Schema, RLS policies, triggers and seeds (run in order)
supabase/tests/             Migration + behaviour tests against a local Postgres
tests/                      Vitest unit tests for the pure business logic

app/
├── lib/
│   ├── auth.ts             Session: staff, role, permissions, 2FA level; guards
│   ├── permissions.ts      The permission catalogue (module.action)
│   ├── settings.ts         Property settings (times, tax, fees, security)
│   ├── pricing.ts          quoteStay(): base/weekend rate → season → plan → LOS
│   ├── tax.ts              GST slab split, inclusive or exclusive
│   ├── policies.ts         Cancellation / no-show penalties, early/late fees, folio totals
│   ├── room-assignment.ts  Eligible rooms ranked by preference and VIP
│   ├── folio.ts            Room-charge posting shared by night audit and check-out
│   ├── notifications.ts    Guest emails/SMS with an outbox record
│   ├── integrations.ts     Email (Resend), SMS (Twilio), door-lock webhook
│   └── booking-request.ts  Website requests (service role)
│
└── admin/
    ├── *-actions.ts        Server actions per area, each re-checking its permission
    ├── login/, security/   Sign-in with lockout, TOTP verify, password & 2FA
    └── (protected)/
        ├── page.tsx        Dashboard
        ├── front-desk/     Arrivals, departures, in-house, search, requests
        ├── bookings/       List, new, detail, check-in, check-out, folio, reg. card
        ├── groups/         Group blocks and rooming lists
        ├── tape-chart/     Rooms × dates planner
        ├── rooms/          Status board, blocks, inventory, availability
        ├── rates/          Room types, plans, seasons, restrictions, allocation
        ├── companies/      Corporate accounts
        ├── night-audit/    Close the day; daily reports
        ├── staff/ roles/ settings/ audit/
```

## How booking works

**Statuses:** Tentative, Confirmed, Checked-In, Checked-Out, Cancelled, No-Show,
Waitlisted. **Sources:** Walk-in, Phone, Email, Website, OTA, Travel Agent,
Corporate, Mobile App.

- **Website** requests are priced from the public Best Available Rate, held as
  *tentative* for the configured hold period, and acknowledged by email. If the
  website's channel allocation or the hotel is full they are *waitlisted*.
- **Staff** bookings require name, phone, email, dates, room type, rate plan and
  payment method; ID can be taken now or at check-in. The form quotes live using
  the same pricing code the server re-runs on submit.
- **Groups** block many rooms in one transaction — all or nothing — with names
  added later on the rooming list.

**Overbooking is refused by the database.** A trigger
(`enforce_booking_inventory`) takes a lock per room type, counts tentative,
confirmed and in-house rooms for every night against rooms not blocked that
night, and rejects the write if it would exceed capacity. It also refuses to
put two stays in one physical room or a guest in a blocked room. A role with
`bookings.overbook` can sell beyond capacity by giving a reason, which is
stored and audited. Room types with no rooms in inventory are not checked.

**Pricing:** base rate (or weekend rate on Fri/Sat) → highest-priority season
→ rate-plan adjustment → length-of-stay discount, plus extra adults above the
room type's included occupancy. MinLOS/MaxLOS, CTA, CTD and blackouts come from
rate plans and restrictions. The agreed price per night is stored on the booking
(`rate_breakdown`), so later rate changes never alter it.

**Cancellation and no-show penalties** follow the rate plan; staff see the
amount before confirming, and waiving needs `bookings.waive_penalty`.

**Every change is audited.** Triggers write who, when, the module, and the
before/after values of changed fields to `audit_log`, which nobody can edit or
delete. Each booking shows its own history.

## Front desk

- **Check-in** requires a vacant, *inspected* room (ranked by floor/view
  preference and VIP), government ID (passport and visa for foreign nationals,
  for Form C), a signed registration card (e-signature), and the deposit or a
  guarantee. Scans and signatures go to the private `guest-documents` bucket,
  readable only with `guests.view_id`; those roles see them, with the full ID
  number, from the booking's *View ID & scans* link (each visit is audited,
  links expire in 5 minutes). An early-arrival fee is offered and can
  be waived (logged). Key cards are sent to the door-lock webhook if one is set.
- **Check-out** posts any unposted room nights, offers the late fee, takes the
  settlement, releases the room as *dirty*, and (express check-out) emails the
  bill. A balance can remain only on a company account or with a recorded reason.
- **Night audit** posts room charges and tax for the night, marks no-shows,
  releases expired holds, closes the day's payments, syncs room blocks, purges
  ID scans past retention, saves the daily report (occupancy, ADR, RevPAR,
  revenue, payments by method and cashier) and rolls the business date.
- **Room status** has two parts: availability (available / occupied / out of
  order / out of service) and housekeeping (dirty → cleaning → clean →
  inspected). Out-of-order and out-of-service are date-ranged blocks with a
  reason, removed from bookable inventory.

## Housekeeping

- **Tasks** are created automatically when a guest checks out (or moves
  room), and deep cleans are scheduled every *N* days (Settings) by night
  audit. Supervisors can also add a task from the **Housekeeping** board.
- **Assignment** is automatic: on-duty housekeepers whose zone covers the
  room's floor first, then whoever has the fewest open tasks. Supervisors
  reassign from the board and set zones and duty on **Setup**.
- **Flow:** Dirty → *Start* (Cleaning) → checklist of linen, amenities and
  minibar → *Done* (Clean) → supervisor *Pass* (Inspected — ready for guest)
  or *Fail* (back to Dirty with a note). Only inspected rooms can be checked
  into.
- **Turnaround targets** per room type (Rates) or the property default
  (Settings); overdue cleans are flagged on the board and dashboard.
- **My tasks** is the housekeeper's phone/tablet view.
- **Lost & found** logs items against the room (or a location) and date.
- **DND** is set on the board, or by in-room controls posting to
  `/api/room-controls` with `ROOM_CONTROLS_SECRET`.

## Maintenance

- **Tickets** can be raised by anyone (the *Report problems* permission is on
  every role) against a room, an asset or a place, with photos. Priority is
  Low / Medium / High / Urgent. Maintenance requests logged at the front desk
  and rooms blocked from **Rooms** become tickets automatically.
- **Flow:** Open → *Start* (In progress) ⇄ *On hold* (with a reason) →
  *Resolved* (what was done, optional after-photos). Supervisors assign,
  change priority, cancel and reopen. **My tickets** is the engineer's phone
  view; unassigned tickets can be picked up there.
- **Rooms:** ticking *the room cannot be sold* takes it out of order from
  today (refused while a stay is assigned — move the guest first). Resolving
  the ticket puts it back into inventory, marked dirty for housekeeping.
- **Targets** per priority (**Maintenance → Targets**, default 2 / 8 / 24 /
  72 hours). A ticket past its target is escalated once; urgent tickets alert
  at once. Alerts go to everyone whose role has *Assign tickets* — on the board
  and dashboard, and by email/SMS when Resend/Twilio are configured.
- **Assets** each keep their own maintenance history. **Preventive**
  schedules (e.g. AC servicing every 90 days) raise a ticket when due.
- Escalation and preventive tickets run at night audit, whenever the board is
  opened, and from `GET /api/cron/maintenance` with
  `Authorization: Bearer $CRON_SECRET` — schedule it every 15–30 minutes
  (Vercel Cron sends that header when `CRON_SECRET` is set).

## HR & attendance

- **My work** (every staff member): clock in / out, this week's shifts, own
  attendance, and leave requests.
- **Staff profiles** (HR): employee ID, department, designation, joining
  date, usual shift and weekly day off, contact and emergency contact —
  edited under **HR → Staff**, alongside 30-day performance (attendance,
  rooms cleaned and passed first time, tickets resolved within target, guest
  feedback).
- **Shift types** (Morning, Afternoon, Night, Split) are configurable.
  **Roster** is a week grid; *Fill from shift patterns* and *Copy last week*
  do most of the work.
- **Attendance:** self clock-in, manual entry by HR, or biometric devices
  posting to `/api/attendance` with `ATTENDANCE_API_SECRET` (matched by
  employee ID). Setting the hotel's location in **HR → Setup** records how far
  away each phone clock-in was, and can require staff to be on site.
- **Leave:** request → approve / decline (nobody approves their own).
- Housekeeping auto-assignment skips staff on approved leave or rostered off,
  and prefers those rostered that day.
- **Payroll export** (CSV) per person: shifts, days present, hours, late
  arrivals, absences and leave by type. It is data for payroll software, not
  a payroll engine.

## Guests

- **Profiles** (**Guests**) hold contact details, nationality, language,
  birthday and anniversary, preferred room type and floor, dietary needs,
  preferences, notes and marketing consent, with stay history, nights, total
  spend (roles with folio access) and cancellations.
- **Tags:** VIP and Blacklisted are set by staff (a reason is required for
  Blacklisted, shown at booking and check-in; a new booking for a blacklisted
  guest needs an explicit override). Repeat Guest (two or more stays) and
  Corporate (linked company) are derived.
- **Occasions** lists birthdays and anniversaries in the next 30 days, marking
  guests who are staying then and whether they agreed to receive offers.
- **Feedback:** express check-out emails the bill with a private link to
  `/feedback/<token>` (one use, per stay). The desk can also record feedback.
  Averages by room, service, cleanliness and food are on the Feedback tab.
- **Duplicates** groups profiles sharing an email, phone (ignoring spaces and
  the country code) or name; merging moves stays, ID and feedback onto the
  kept profile.
- **Privacy** (*guests.privacy*): download everything held about a guest as
  JSON, or erase their personal data — the name, contact details, ID, scans
  and preferences go; bookings and amounts stay, anonymised, for tax records.
  Audit-log entries are kept as the legal record.
- **Loyalty points and membership tiers** are left for the payments phase.

## Roles and security

Roles are rows in the database with a configurable set of permissions
(`module.action`, e.g. `bookings.cancel`, `folio.payment`). Twelve roles ship —
System Administrator, General Manager, Front Office Manager, Front Desk Agent,
Housekeeping Supervisor, Housekeeping Staff, POS Cashier, Finance/Accounts,
Sales & Marketing, Maintenance/Engineering, Engineering Supervisor, HR Manager —
and administrators can edit them or
create their own at **Roles**. Someone's actual job goes in their free-text job
title.

Enforced in layers: `proxy.ts` redirects signed-out traffic; every page and
server action checks the specific permission; Postgres RLS policies call
`has_permission()` as the final backstop.

- **Two-factor** for any role marked "requires 2FA" (administrators and
  finance by default); anyone can opt in at **Password & 2FA**.
  - **Demo mode (current default):** `TWO_FACTOR_MODE=demo` — the code is
    always `DEMO_2FA_CODE` (`123456`), shown on the sign-in screen. It protects
    nothing; it only demonstrates the flow.
  - **Real mode:** set `TWO_FACTOR_MODE=totp` to use authenticator apps via
    Supabase MFA. Do this before real guest data is entered.
- **Passwords:** minimum length and complexity, expiry, forced change after an
  administrator sets one, and **lockout** after repeated failures.
- **Auto sign-out** after the configured idle time, with a one-minute warning.
- Administrators cannot change their own role or access.
- **Activity & sessions** (**Staff → Activity & sessions**): who is active,
  last sign-in and IP, failed sign-ins, changes made today, and *End sessions*
  — the person is signed out on every device at their next page load.
- **Message templates** (**Settings → Edit message templates**): the subject,
  opening and closing paragraphs and SMS of every guest message, per enabled
  language, with placeholders such as `{GuestName}` and `{CheckInDate}` and a
  live preview. Guests get their profile language when a template exists,
  otherwise the default language. The staff panel itself is in English.

## Content and sources

Facts on the site are taken from the hotel's published material and should not be changed without checking with the owner.

- **Rates** now live in the database and are edited at `/admin/rates`. The published tariff (Premier ₹9,499, Luxury ₹10,799, extra occupant ₹2,200, child without bed ₹1,500, buffet ₹1,470, child meal ₹750) is seeded by the migration and duplicated in `app/lib/rates-fallback.ts`, which serves the public site if Supabase is unreachable. Keep the two in step.
- **Rates are quoted on the CPAI plan** — accommodation with breakfast — and are inclusive of applicable taxes. Lunch and dinner are charged separately. This is stated on the room cards, the detail modal, the charges panel, and the admin rates page.
- **Contact details** (`0194-3500113`, `+91 90700 90713`, `0194-3517164`, `info@hotelsamciriviera.com`) live in `app/lib/site.ts` and in `Footer.tsx`.
- **Photography** in `public/gallery/` is the hotel's own, mirrored from the original site. It is the only genuine imagery in the repo. Room photographs can be replaced from `/admin/rates`, which uploads to the `room-photos` Supabase Storage bucket and points the room type at the new public URL.

## Known gaps

Tracked so nobody rediscovers them:

1. **Folio is minimal.** It records charges, tax, payments, penalties and voids
   enough for night audit and check-out. Sequential tax invoices, split folios,
   city-ledger invoicing, refund approvals and currency conversion are Module 7.
2. **No payment gateway.** Deposits and payments are recorded by method and
   reference; online card capture is a Phase 8 integration.
3. **OTA channel allocation** is stored but only the website enforces it until
   the channel manager (Module 9) exists.
4. **Door locks, email and SMS** are integration hooks switched on by
   environment variables; without them the attempt is recorded as skipped.
5. **Single property.** Tables carry no property id yet (Module 14).
6. **No contact section** on the public site; Royal and Presidential Suites need
   rates from the owner before they can be added at `/admin/rates`.
7. **One lint warning** remains: `<img>` in the Hero section.
8. **Loyalty points and tiers** (Module 8) and **multiple currencies with
   exchange rates** (Modules 7 and 15) wait for the payments phase; the
   property has one base currency today.
9. **The staff panel is English only.** Languages apply to guest messages.

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
