# 01 — Product Requirements Document (PRD)

**Project:** Ridely (working name — a full-stack ride-hailing / cab booking web app, "Uber clone")
**Document status:** Source of truth for WHAT is built. Other docs define HOW.
**App name:** Configurable via `NEXT_PUBLIC_APP_NAME` (default `Ridely`). Never hardcode the name in components.

---

## 1. Vision & Goals

Build a production-quality, mobile-first ride-hailing web application where:
- **Riders** book rides, track drivers live, pay securely, rate drivers, and view history/receipts.
- **Drivers** register, get approved, go online, accept/decline requests, complete rides, and see earnings.
- **Admins** approve drivers, manage pricing/promos, handle support tickets and SOS alerts.

This is also a **portfolio/learning project** — code must be clean, typed, tested, documented, and deployable.

### Success criteria
1. A rider and a driver (two browsers) can complete the full loop: sign up → request → match → track → complete → pay → rate → receipt.
2. All 13 use cases in section 6 work end to end.
3. App is responsive (360px → 1440px), passes Lighthouse ≥ 85 performance/accessibility on key pages.
4. Deployed on Vercel + Supabase with working Stripe test-mode payments.

### Non-goals (out of scope for v1)
- Native iOS/Android apps (web is mobile responsive; PWA optional).
- Real emergency-services integration (SOS notifies contacts/admin only).
- Real money payouts to drivers (earnings are tracked in a ledger; Stripe Connect is an optional Phase 2).
- Multi-city/multi-country, ride pooling, scheduled rides, in-app chat/calls (listed under "Future").

---

## 2. User Roles

| Role | How obtained | Capabilities |
|---|---|---|
| **Rider** | Default at onboarding | Book, track, pay, rate, cancel, history, SOS, support, promos, saved cards, emergency contacts |
| **Driver** | Chosen at onboarding + admin approval | Go online/offline, receive & accept/decline offers, run ride, confirm cash, earnings, history |
| **Admin** | Set manually (Clerk `publicMetadata.role = "admin"`) | Everything in /admin: users, driver approval, rides, promos, pricing, tickets, SOS |

A user has exactly ONE role. Role is stored in Clerk `publicMetadata.role` (source for auth) and mirrored in `profiles.role` (via webhook).

---

## 3. Feature List (MoSCoW)

### Must have (MVP)
| ID | Feature | Summary |
|---|---|---|
| F1 | Authentication | Email + Google social login via Clerk; role onboarding; protected routes |
| F2 | Profile management | Name, phone, avatar; rider payment methods; driver vehicle/licence info |
| F3 | Ride booking | Places autocomplete, route preview, ride types, fare estimate, confirm |
| F4 | Fare estimation | Distance + time + base fare × ride-type × surge, shown before confirm |
| F5 | Driver dashboard | Online toggle, incoming offers, accept/decline, active ride controls |
| F6 | Ride matching | Nearest available drivers (PostGIS), offers with timeout, atomic accept |
| F7 | Real-time updates | Ride status + driver GPS pushed live (Supabase Realtime) |
| F8 | Payments | Stripe card payments (test mode), cash option, webhooks |
| F9 | Ride history & receipts | List, detail, downloadable PDF receipt, emailed receipt |
| F10 | Ratings & reviews | 1–5 stars + optional comment; driver average rating |
| F11 | Ride cancellation | Rider/driver cancel with fee rules |
| F12 | Responsive UI | Mobile-first, works 360px–desktop |

### Should have
| ID | Feature | Summary |
|---|---|---|
| F13 | Promo codes | Percent/flat discounts with limits and expiry |
| F14 | Multi-stop rides | Up to 3 intermediate stops; route and fare adapt |
| F15 | Emergency SOS | Button during ride → notify emergency contacts + admin, share live-location link |
| F16 | Support / Help center | Ticket categories, thread, admin replies |
| F17 | In-app notifications | Bell icon, toasts, notification list (realtime) |
| F18 | Admin panel | Driver approval, users, rides, promos, pricing, tickets, SOS |

### Could have (only after all above are done)
Wallet balance, UPI via Stripe (if account supports), web push notifications, PWA install, dark mode, driver Stripe Connect payouts, multi-language, scheduled rides.

---

## 4. Detailed Functional Requirements

### 4.1 Authentication & Onboarding (F1)
- Sign up / sign in with email+password and Google (Clerk components, themed with Tailwind).
- After first sign-in, user is redirected to `/onboarding` to pick **Rider** or **Driver**. Choice writes `publicMetadata.role` via server route, then redirects to the role's dashboard.
- Drivers continue to `/driver/onboarding` (vehicle + licence) and see "Pending approval" until an admin approves.
- Clerk webhook (`user.created`, `user.updated`, `user.deleted`) syncs into `profiles`.
- Middleware protects: `/dashboard`, `/book`, `/rides/*`, `/history/*`, `/profile/*`, `/support/*` (rider); `/driver/*` (driver, approved except onboarding); `/admin/*` (admin).
- Unauthorized role access → redirect to own dashboard with a toast; API returns 403.
- Phone number is a **profile field**, not a Clerk sign-in requirement (SMS verification is unreliable/costly in India during dev). Validate format (E.164, default +91).

### 4.2 Profile Management (F2)
- Rider: edit name, phone, avatar (upload to Supabase Storage bucket `avatars`, max 2 MB, jpg/png/webp), manage saved cards (Stripe SetupIntent; list/remove), manage up to 5 emergency contacts (name, phone, optional email).
- Driver: all above plus vehicle make/model/colour/plate/year, ride type, licence number, licence expiry; documents upload optional (`driver-docs` private bucket).
- Deleting an account is handled by Clerk; webhook anonymises profile (keep rides for accounting).

### 4.3 Ride Booking (F3, F4, F14)
Flow on `/book` (map + bottom sheet on mobile, side panel on desktop):
1. Pickup: defaults to current geolocation (with permission) — editable via Places Autocomplete. Drop-off required. Optional "Add stop" (max 3).
2. System calls `POST /api/fare/estimate` → returns route polyline, distance, duration, and a fare for **each ride type**.
3. Rider selects ride type, optionally applies promo, selects payment method (Card / Cash), and presses **Confirm ride**.
4. `POST /api/rides` creates ride in status `requested`, locks the fare quote, and triggers matching.
5. Rider is moved to `/rides/[id]` ("Finding your driver…" with cancel button).
- Fare quote is valid for 5 minutes; after that re-estimate is forced.
- Cannot have more than one active ride (statuses: requested, accepted, arrived, in_progress).
- Pickup and drop-off must differ by ≥ 200 m and be within service area (config: `MAX_RIDE_DISTANCE_KM`, default 100).

**Ride types (seed data, INR):**
| Code | Name | Base | Per km | Per min | Min fare | Capacity |
|---|---|---|---|---|---|---|
| bike | Bike | ₹15 | ₹6 | ₹0.8 | ₹30 | 1 |
| auto | Auto | ₹25 | ₹10 | ₹1 | ₹40 | 3 |
| mini | Mini | ₹40 | ₹12 | ₹1.5 | ₹70 | 4 |
| sedan | Sedan | ₹50 | ₹15 | ₹2 | ₹90 | 4 |
| xl | XL | ₹70 | ₹20 | ₹2.5 | ₹130 | 6 |

**Fare formula:** `fare = max(min_fare, (base + per_km×km + per_min×min) × surge) − discount + booking_fee(₹5) ; GST/taxes shown as separate line only if configured`. All money is stored as **integer paise**.
**Surge:** `ratio = open_requests_in_5km / max(1, online_drivers_in_5km)`; multiplier = 1.0 if ratio<1, 1.2 if <2, 1.5 if <3, else 2.0 (cap, admin-configurable, can be disabled).

### 4.4 Matching & Driver Dashboard (F5, F6)
- Driver toggles **Online/Offline**; while online the browser sends location every 5 s (`PUT /api/driver/location`) using `watchPosition`.
- On new ride: server finds up to 5 nearest online, approved, non-busy drivers within 5 km (expand to 8 km if none) of the pickup matching ride type; inserts `ride_offers` (status `pending`, expires in 30 s).
- Driver sees an offer card (pickup, drop-off, distance to pickup, trip distance, fare, countdown). **Accept** performs an atomic update (`UPDATE rides SET driver_id=… WHERE id=… AND status='requested'`); the first valid accept wins, others get "Ride no longer available". **Decline** or timeout marks offer `declined/expired`.
- If all offers expire, retry with next nearest drivers (up to 3 rounds). If none accept within 2 minutes → ride `expired`, rider notified ("No drivers available").
- After accept, driver controls: **Arrived** → **Start ride** (rider OTP, 4 digits shown to rider — verifies correct rider) → **Complete ride**. Navigation: "Open in Google Maps" deep link + in-app route.
- Driver may cancel after accept (counts toward cancellation rate; ride returns to `requested` and re-matches, excluding that driver).

### 4.5 Ride Lifecycle (F7, F11)
```
requested ──accept──▶ accepted ──arrived──▶ arrived ──start(OTP)──▶ in_progress ──complete──▶ completed
   │                      │                    │
   ├─ no drivers ─▶ expired                     └─ cancel ─▶ cancelled
   └─ rider cancel ─▶ cancelled (free)    (accepted/arrived rider cancel: fee may apply)
```
- Every transition is validated server-side (state machine in `lib/rides/state-machine.ts`), logged in `ride_events`, and creates notifications.
- **Cancellation fees:** free within 2 min of acceptance or before acceptance; after that ₹30 (admin-configurable); free if driver cancels or driver arrived >10 min late; fee charged on next ride/or recorded as `cancellation_fee` payment.
- Live tracking: rider subscribes to the ride row and driver location; map animates marker smoothly; ETA recalculated every 20 s (Routes API) while accepted/in_progress.

### 4.6 Payments (F8)
- **Card:** Stripe Customer per rider; cards saved via SetupIntent + Payment Element. When ride completes, rider is shown a pay screen; with a saved default card, "Pay ₹X" confirms a PaymentIntent. (Auto-charge off-session is optional improvement.)
- **Cash:** rider chooses cash at booking; driver taps "Cash received" on completion.
- **Webhook** `/api/webhooks/stripe` handles `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `setup_intent.succeeded` — signature verified, idempotent (`stripe_events` table).
- On success: payment `succeeded`, driver earning row created (commission 20% default → admin config), receipt number generated, email sent.
- Failed payment: ride stays `completed` with payment `pending`; rider can retry; blocked from new bookings until paid.
- Refunds: admin-initiated from /admin/rides (full or partial).
- **India note:** Stripe account availability in India is limited; build for **test mode** (cards `4242 4242 4242 4242`). Keep the payment layer behind an interface (`lib/payments/provider.ts`) so Razorpay can be swapped in later.

### 4.7 History & Receipts (F9)
- `/history`: paginated list (10/page), filters (status, date range), shows date, route, fare, status, driver/rider name.
- `/history/[id]`: map of route, timeline, fare breakdown, driver info, payment status, **Download receipt (PDF)** and **Email receipt**.
- Driver history shows earnings per ride (fare − commission).
- Receipt contains: receipt no. (`RCP-YYYYMMDD-XXXXX`), date, rider, driver, vehicle, pickup/drop-off, distance, duration, fare breakdown (base, distance, time, surge, discount, fees, total), payment method.

### 4.8 Ratings (F10)
- After completion (and payment/cash), rider is prompted: 1–5 stars, optional tags (Polite, Clean car, Safe driving, Good navigation), optional comment (≤ 500 chars). One rating per ride; editable for 24 h.
- Driver may rate rider (1–5, optional) — stored, shown to admins only.
- `driver_profiles.avg_rating` and `rating_count` maintained by DB trigger. Driver profile card shows average and last 5 reviews.

### 4.9 Promo Codes (F13)
Fields: code, type (percent|flat), value, max_discount, min_fare, valid_from/to, global_limit, per_user_limit, ride_types[], active. Validation endpoint returns discount preview; redemption recorded only when ride is **completed**. Seed: `WELCOME50` (50% up to ₹100, first ride), `FLAT30` (₹30 off min fare ₹150).

### 4.10 Emergency SOS (F15)
- SOS button visible on `/rides/[id]` when `in_progress` (and `accepted/arrived`). Requires 2-step confirm (press & hold 2 s) to avoid accidents.
- Creates `sos_events` row; notifies: all emergency contacts via email (Resend) with a **public live-location link** (`/sos/[token]`, no login, expires in 6 h, shows ride route & live position, driver/vehicle details), admin dashboard alert (realtime), and in-app confirmation. SMS via Twilio is optional (config flag `SMS_ENABLED`).
- Rider can mark "I'm safe" to resolve; admin can resolve and add notes.
- Display a disclaimer: *"This does not contact police. In an emergency call 112."*

### 4.11 Support / Help Center (F16)
Static FAQ at `/help` + ticket system: categories (payment issue, lost item, driver behaviour, ride issue, app bug, other), optional linked ride, subject, description, up to 3 image attachments. Thread view with status (open, in_progress, resolved, closed). Admin replies from `/admin/tickets`; user gets notification + email.

### 4.12 Notifications (F17)
Events: ride accepted, driver arrived, ride started, ride completed, payment success/failure, ride cancelled, offer received (driver), approval status (driver), ticket reply, SOS. Delivered via `notifications` table + Realtime → bell dropdown + toast. Email for receipts, ticket replies, SOS, driver approval.

### 4.13 Admin Panel (F18)
Dashboard KPIs (rides today, active rides, online drivers, revenue, open tickets, open SOS); users table (search, suspend/unsuspend); driver approvals (view details, approve/reject with reason); rides table (filter, view, refund); promo CRUD; pricing/surge/commission settings; tickets; SOS list.

---

## 5. Non-Functional Requirements
| Area | Requirement |
|---|---|
| Performance | LCP < 2.5 s on 4G for landing/dashboard; API p95 < 500 ms (excluding third-party calls); map loads lazily |
| Security | OWASP Top 10 aware; all inputs validated with Zod; RLS on every table; secrets only server-side; Stripe/Clerk webhook signatures verified; rate limiting on sensitive endpoints; no PII in logs |
| Privacy | Driver live location visible to rider only during active ride; location history retention 30 days; privacy policy + terms pages |
| Accessibility | WCAG 2.1 AA: keyboard navigation, focus rings, aria labels, contrast ≥ 4.5:1, map has text alternative (address list) |
| Responsiveness | Mobile-first; breakpoints 360 / 768 / 1024 / 1440 |
| Reliability | Idempotent webhooks; atomic ride acceptance; graceful handling of lost connection (auto-reconnect + refetch) |
| Observability | Structured server logs, error boundary pages, optional Sentry |
| Browser support | Latest 2 versions of Chrome, Edge, Safari, Firefox; iOS Safari 16+ |
| Localisation | English, INR currency, `Asia/Kolkata` timezone, +91 phone default; i18n-ready strings optional |

---

## 6. Use Case Coverage Matrix (from original brief)
| # | Use case | Feature IDs | Pages |
|---|---|---|---|
| 1 | Registration & authentication | F1 | /sign-in, /sign-up, /onboarding |
| 2 | Profile management | F2 | /profile, /profile/payment-methods |
| 3 | Booking a ride | F3, F5, F6 | /book, /rides/[id] |
| 4 | Real-time tracking | F7, F17 | /rides/[id] |
| 5 | Fare estimation | F4 | /book |
| 6 | Payment via Stripe | F8 | /rides/[id]/pay |
| 7 | History & receipts | F9 | /history, /history/[id] |
| 8 | Cancel ride | F11 | /rides/[id] |
| 9 | Ratings & reviews | F10 | /rides/[id]/rate |
| 10 | Multi-stop | F14 | /book |
| 11 | Promo codes | F13 | /book, /admin/promos |
| 12 | SOS | F15 | /rides/[id], /sos/[token] |
| 13 | Support | F16 | /help, /support/* |

## 7. Assumptions (change by editing this doc)
1. Single city/region initially (default map centre: Mumbai 19.0760, 72.8777), currency INR.
2. One role per account. 3. Cash payment supported. 4. Stripe in test mode for v1.
5. Driver approval is manual by admin. 6. No SMS dependency in MVP. 7. English only.

## 8. Future Roadmap
Wallet, Stripe Connect payouts, scheduled rides, in-app chat/masked calling, ride sharing, web push, native apps (React Native), driver heat-maps, referral codes, multi-language.
