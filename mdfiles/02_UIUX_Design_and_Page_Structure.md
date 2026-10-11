# 02 — UI/UX Design & Page Structure

Defines how the app looks, behaves, and is organised. Companion to `01_PRD`. If something is not specified here, choose the simplest accessible option consistent with this document and note it in `docs/DECISIONS.md`.

---

## 1. Design Principles
1. **Map-first, task-first:** on booking/tracking screens the map is the hero; controls live in a bottom sheet (mobile) or left panel (desktop).
2. **Mobile-first:** design at 360 px, scale up. Thumb-reachable primary actions at the bottom.
3. **One primary action per screen**, clearly styled.
4. **Always show state:** loading skeletons, empty states with guidance, friendly errors with retry.
5. **Trust & safety visible:** driver photo, plate, rating, SOS, OTP always easy to find during a ride.
6. **Original branding:** do not copy Uber's logo, fonts, or exact visual identity.

## 2. Design System

### 2.1 Colours (define as CSS variables + Tailwind theme tokens)
| Token | Hex | Use |
|---|---|---|
| `--brand` | `#10B981` (emerald 500) | Primary buttons, active states, route line |
| `--brand-dark` | `#047857` | Hover/pressed |
| `--ink` | `#0B1220` | Primary text, header |
| `--muted` | `#64748B` | Secondary text |
| `--surface` | `#FFFFFF` | Cards/sheets |
| `--bg` | `#F6F8FA` | Page background |
| `--border` | `#E2E8F0` | Dividers |
| `--danger` | `#DC2626` | Errors, cancel, SOS |
| `--warning` | `#F59E0B` | Surge, pending |
| `--info` | `#2563EB` | Links, in-progress |
(If the user provides a brand palette/logo in `/public/brand`, it overrides these tokens.)

### 2.2 Typography
Font: **Inter** (next/font). Scale: 12/14/16/18/20/24/30/36. Headings 600–700, body 400–500. Line-height 1.5 body, 1.2 headings. Fare/price text uses tabular numbers.

### 2.3 Spacing, radius, elevation
4-px grid; radius: inputs/buttons 12px, cards 16px, bottom sheets 24px top corners; shadows: `sm` for cards, `lg` for sheets/modals.

### 2.4 Components (build with shadcn/ui + Tailwind, placed in `components/ui` and feature folders)
Button (primary/secondary/ghost/danger, loading), Input, Select, Textarea, Checkbox/Switch, Dialog, Sheet/BottomSheet, Tabs, Badge (status colours), Avatar, Skeleton, Toast (sonner), Dropdown, Tooltip, Pagination, Table (responsive → cards on mobile), StarRating, StatusTimeline, Stepper, EmptyState, ErrorState, ConfirmDialog, OTPDisplay, CountdownRing, FareBreakdown, RideTypeCard, MapView, PlaceAutocomplete, DriverCard, NotificationBell.

**Status badge colours:** requested=amber, accepted=blue, arrived=indigo, in_progress=emerald, completed=green, cancelled=slate, expired=slate, pending payment=amber, paid=green, failed=red.

### 2.5 Accessibility
Visible focus ring (2 px brand), labels on all inputs, `aria-live="polite"` for ride status changes, buttons ≥ 44×44 px, don't rely on colour alone, reduced-motion respected, map alternative = text list of addresses and ETA.

### 2.6 Motion
150–250 ms transitions; bottom sheet slides; driver marker interpolates between GPS updates; countdown ring for offers; skeleton shimmer.

---

## 3. Global Layout
- **Public header:** logo, "How it works", "Drive with us", Sign in / Sign up.
- **Rider app shell:** top bar (logo, notification bell, avatar menu), bottom tab bar on mobile (Home, Book, History, Profile) / left sidebar on desktop.
- **Driver app shell:** top bar with **Online/Offline switch** always visible, bottom tabs (Dashboard, Earnings, History, Profile).
- **Admin shell:** collapsible sidebar (Overview, Users, Drivers, Rides, Promos, Pricing, Tickets, SOS), top bar with admin identity.
- **Footer (public):** links to Terms, Privacy, Help, contact email.

## 4. Sitemap & Page Specifications

### 4.1 Public pages
| Route | Purpose | Sections / content |
|---|---|---|
| `/` | Landing | Hero (headline, "Book a ride" + "Become a driver" CTAs), quick pickup/drop-off teaser input (redirects to sign-in → /book), How it works (3 steps), Ride types, Safety features, Driver CTA, FAQ preview, Footer |
| `/how-it-works` | Explain | Rider and driver steps, safety, pricing transparency |
| `/help` | Help center | Searchable FAQ accordion (seed ≥ 12 Q&As), "Contact support" CTA (signed-in → /support/new) |
| `/terms`, `/privacy` | Legal | Placeholder text clearly marked "TEMPLATE — review with a lawyer" |
| `/sos/[token]` | Public SOS tracker | Read-only map, rider name, driver + vehicle info, last update time, expiry notice. No nav |
| `/sign-in`, `/sign-up` | Clerk | Centered Clerk component, brand panel on desktop |
| `/onboarding` | Pick role | Two large cards: "I need rides" / "I want to drive"; confirm button |
| `/not-found`, `/error` | Errors | Friendly message, home button |

### 4.2 Rider pages
**`/dashboard`** — greeting; "Where to?" input card (opens /book); active ride banner (if any, links to tracking); recent rides (3); saved places (Home/Work — optional); promo banner; quick links.

**`/book`** — *core screen.*
- Desktop: left panel 420 px (form) + right full-height map. Mobile: full-screen map + draggable bottom sheet (peek / half / full).
- Step 1 *Locations:* pickup (with "use current location" button), stops (add/remove, up to 3, drag to reorder optional), drop-off. Autocomplete limited to country `IN`, biased to user location.
- Step 2 *Choose ride:* list of `RideTypeCard` (icon, name, capacity, ETA to nearest driver, fare, surge badge). Selected highlighted.
- Step 3 *Confirm:* promo code field (Apply → shows discount or error), payment method selector (Card •••• / Cash / Add card), `FareBreakdown` collapsible, primary button **"Confirm {RideType} · ₹{fare}"**.
- States: no route found, outside service area, fare expired (banner "Prices updated"), already has active ride (redirect), geolocation denied (manual entry hint).

**`/rides/[id]`** — live ride screen (state-driven):
| Status | UI |
|---|---|
| requested | Pulsing radar animation, "Finding your driver…", elapsed timer, route on map, **Cancel** |
| accepted | Driver card (photo, name, ★ rating, vehicle, plate, ride type), **OTP** (large), ETA, live marker, Call driver (tel: link) / Cancel (shows fee notice) |
| arrived | "Your driver has arrived" highlight, OTP prominent, 10 min wait timer |
| in_progress | Route progress, ETA to destination, share-trip link (copy), **SOS** (press & hold), fare so far |
| completed | Summary + Pay (card) / "Pay cash to driver" → then Rate |
| cancelled / expired | Reason, fee (if any), "Book again" |
- Persistent top status chip + timeline. Toast on each change.

**`/rides/[id]/pay`** — fare breakdown, payment method chooser, Stripe Payment Element for new card, "Pay ₹X" button, success animation → redirect to rate. Failure state with retry.

**`/rides/[id]/rate`** — driver avatar, 5 stars, tag chips, comment textarea, Submit/Skip; thank-you screen.

**`/history`** — filter bar (status, date range), list of ride cards (map thumbnail optional, date, from → to, fare, status badge), pagination; empty state "No rides yet — Book your first ride".

**`/history/[id]`** — static route map, timeline with timestamps, driver/vehicle, fare breakdown, payment info, buttons: **Download receipt**, **Email receipt**, **Report an issue** (opens ticket prefilled), **Rebook this trip**.

**`/profile`** — tabs: *Personal info* (avatar upload, name, email read-only, phone), *Payment methods* (cards list, add via Stripe, set default, remove), *Emergency contacts* (list/add/edit/delete, max 5), *Preferences* (notifications email on/off), *Danger zone* (delete account via Clerk).

**`/support`** — list of my tickets with status; **`/support/new`** — category, linked ride (dropdown of recent rides), subject, description, attachments; **`/support/[id]`** — chat-style thread, reply box, status badge.

### 4.3 Driver pages
**`/driver/onboarding`** — stepper: 1 Personal (confirm phone), 2 Vehicle (make, model, year, colour, plate, ride type), 3 Licence (number, expiry, optional photo upload), 4 Review & submit. After submit: `/driver/pending`.

**`/driver/pending`** — "Application under review" with status, edit details, support link; rejected shows reason + resubmit.

**`/driver`** (dashboard) — Online switch (large), today's stats (rides, earnings, online time, acceptance rate), map centred on driver with surge hint, **incoming offer modal/bottom card** (pickup address, distance to pickup, trip distance & duration, estimated earning, 30 s countdown ring, Accept/Decline; sound + vibration), active ride banner.

**`/driver/rides/[id]`** — active ride control screen: map with route (to pickup → to drop-off), rider name + rating, big action button that changes by status: *Arrived → Enter OTP & Start → Complete ride*; "Open in Google Maps"; Cancel ride (with reason select); on complete: fare summary + "Cash received" (if cash) .

**`/driver/earnings`** — period tabs (Today/Week/Month), total, rides, commission, net, bar chart per day, list of earning rows with payout status.

**`/driver/history`**, **`/driver/profile`** (vehicle, documents, rating summary, reviews list, edit).

### 4.4 Admin pages
`/admin` KPI cards + charts (rides per day, revenue) + live SOS alert banner; `/admin/users` table (search, role filter, suspend); `/admin/drivers` tabs (Pending/Approved/Rejected) → detail drawer with Approve/Reject; `/admin/rides` table with filters, detail drawer, Refund; `/admin/promos` CRUD form; `/admin/pricing` ride type fares, surge settings, commission %, cancellation fee; `/admin/tickets` list + thread reply + status; `/admin/sos` list with map, resolve with notes.

## 5. Key User Flows (must be implementable end to end)
1. **Rider happy path:** Landing → Sign up → Onboarding (Rider) → Dashboard → Book → Choose Mini → Confirm → Finding → Accepted (OTP) → Arrived → In progress → Completed → Pay → Rate → History/receipt.
2. **Driver happy path:** Sign up → Onboarding (Driver) → vehicle/licence → Pending → (Admin approves) → Dashboard → Go online → Offer → Accept → Arrived → Start (OTP) → Complete → Earnings.
3. **Cancel:** Rider cancels in requested (free) / after accepted (fee notice dialog).
4. **SOS:** In progress → press & hold SOS → confirmation → contacts emailed → rider sees "Help alert sent" + "I'm safe".
5. **Support:** History detail → Report issue → ticket → admin reply → notification.

## 6. Copy & Microcopy
Friendly, concise, active voice. Currency format `₹1,234.50` (`Intl.NumberFormat('en-IN')`). Dates `12 Mar 2026, 6:45 PM` (IST). Error pattern: *what happened + what to do*. Empty-state pattern: *icon + one line + action*. Never expose raw error messages/stack traces.

## 7. Map UX Rules
Use Google Maps JS API via `@vis.gl/react-google-maps`. Route polyline brand colour, 5 px; pickup = green dot, drop-off = black square, stops = numbered grey pins, driver = car icon rotated to heading. Auto-fit bounds on route change. Cluster nothing (v1). Map style: light, POI labels reduced. Lazy-load the map (dynamic import, no SSR).

## 8. Responsive Behaviour Summary
| Breakpoint | Behaviour |
|---|---|
| < 640 | Single column, bottom sheets, bottom tab bar, tables → cards |
| 640–1023 | Two-column forms, side drawers |
| ≥ 1024 | Side panel + map, sidebar nav, tables |

## 9. Assets Needed (see doc 07 for how to supply)
Logo (SVG/PNG, light + dark), favicon, hero image/video, ride-type icons (or use default icon set), app name, brand colours, legal text, FAQ copy. **If not supplied:** use generated placeholders (text logo, lucide icons, Unsplash-free gradients) and list each placeholder in `docs/PLACEHOLDERS.md` so the owner can replace them later.
