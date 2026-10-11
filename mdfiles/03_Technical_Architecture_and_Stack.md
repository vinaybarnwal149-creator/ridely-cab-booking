# 03 — Technical Architecture & Technology Stack

## 1. Stack Decisions (final — do not re-litigate; record deviations in `docs/DECISIONS.md`)

The original brief listed several alternatives (Clerk/Supabase/Appwrite, Supabase/Firebase/Postgres, Express/Next API). **One option was chosen for each to keep the project coherent:**

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript (strict)** | Frontend + backend in one repo; Vercel deployment; server components |
| Styling | **Tailwind CSS v4 + shadcn/ui + lucide-react** | Matches brief; accessible primitives |
| Backend | **Next.js Route Handlers (`app/api/**`) + Server Actions for simple form mutations** | Separate Express server adds hosting, CORS, and duplicate auth with no benefit at this scale. Business logic is isolated in `lib/services/*` so it can be moved to Express later |
| Auth | **Clerk** | Brief's primary choice; roles via `publicMetadata`; prebuilt UI; webhooks |
| Database | **Supabase Postgres + PostGIS** | One service gives Postgres, Realtime, Storage, RLS, cron; PostGIS for nearest-driver queries. Firebase rejected (no relational/geo SQL) |
| Realtime | **Supabase Realtime** (`postgres_changes` for rides/notifications, Broadcast for high-frequency driver location) | Same vendor as DB; no extra service |
| Payments | **Stripe** (PaymentIntents, SetupIntents, Payment Element, webhooks), test mode | Per brief; abstracted behind `PaymentProvider` interface |
| Maps | **Google Maps Platform**: Maps JS, Places API (New), Routes API, Geocoding | Per brief |
| Email | **Resend** + React Email templates | Simple DX, free tier |
| PDF receipts | **@react-pdf/renderer** (server-side route) | No headless browser needed on Vercel |
| Validation | **Zod** (shared client/server schemas) | |
| Data fetching | **TanStack Query v5** for client; RSC fetch for server | |
| Forms | **react-hook-form + @hookform/resolvers/zod** | |
| State | React state/Query; **Zustand** only for booking wizard state | |
| Charts | **Recharts** (admin/driver earnings) | |
| Testing | **Vitest** (unit), **Testing Library** (components), **Playwright** (E2E) | |
| Lint/format | ESLint (next/core-web-vitals + typescript-eslint), Prettier, Husky + lint-staged | |
| Package manager | **pnpm** | |
| Hosting | **Vercel** (app) + **Supabase** (DB) | |
| CI | **GitHub Actions**: lint, typecheck, test, build | |
| Rate limiting | **Upstash Redis + @upstash/ratelimit** (optional but recommended; fallback in-memory in dev) | |
| Error tracking | **Sentry** (optional) | |

## 2. High-Level Architecture
```
 Browser (Rider/Driver/Admin)
   │  Next.js pages (RSC + client components), Clerk session cookie
   ├──────────────▶ Next.js on Vercel ──────────────┐
   │                 • middleware.ts (auth + role)   │
   │                 • /api/** route handlers        │──▶ Stripe API  ◀── Stripe webhooks ─┐
   │                 • lib/services (business logic) │──▶ Google Maps (Routes/Places)       │
   │                 • Clerk webhooks ───────────────│──▶ Resend (email)                    │
   │                                                 ▼                                      │
   │                                         Supabase (Postgres + PostGIS + RLS)  ◀──────────┘
   └──── Realtime websocket (JWT from Clerk) ◀── Realtime (rides, notifications, driver location)
                                         Storage buckets (avatars, driver-docs, ticket-files)
                                         pg_cron (expire stale rides/offers/SOS tokens)
```

## 3. Repository Structure
```
/
├─ docs/                     # these documents + DECISIONS.md, PROGRESS.md, PLACEHOLDERS.md, SETUP.md
├─ supabase/
│  ├─ migrations/            # numbered SQL migrations (source of truth for schema)
│  ├─ seed.sql               # ride types, promo codes, app settings, FAQ
│  └─ config.toml
├─ src/
│  ├─ app/
│  │  ├─ (public)/           # /, /how-it-works, /help, /terms, /privacy
│  │  ├─ (auth)/             # sign-in, sign-up
│  │  ├─ onboarding/
│  │  ├─ (rider)/            # dashboard, book, rides/[id], history, profile, support
│  │  ├─ driver/             # onboarding, pending, dashboard, rides/[id], earnings, history, profile
│  │  ├─ admin/
│  │  ├─ sos/[token]/
│  │  └─ api/                # route handlers (see doc 05)
│  ├─ components/
│  │  ├─ ui/                 # shadcn primitives
│  │  ├─ map/ booking/ ride/ driver/ admin/ payments/ layout/ shared/
│  ├─ lib/
│  │  ├─ auth/               # getCurrentUser(), requireRole(), role helpers
│  │  ├─ supabase/           # server client (service role), browser client (Clerk JWT), types
│  │  ├─ stripe/             # server client, helpers, webhook handlers
│  │  ├─ maps/               # routes.ts, places.ts, geo utils
│  │  ├─ pricing/            # fare calculator, surge, promo validator (pure, unit-tested)
│  │  ├─ rides/              # state-machine.ts, matching.ts, otp.ts
│  │  ├─ payments/           # provider.ts interface + stripe-provider.ts
│  │  ├─ email/              # resend client + templates (React Email)
│  │  ├─ pdf/                # receipt document
│  │  ├─ validation/         # Zod schemas
│  │  ├─ services/           # ride.service.ts, driver.service.ts, payment.service.ts, ...
│  │  ├─ errors.ts  logger.ts  env.ts (Zod-validated env)  rate-limit.ts  utils.ts
│  ├─ hooks/                 # useRideRealtime, useDriverLocation, useGeolocation, useNotifications
│  ├─ types/
│  └─ middleware.ts
├─ tests/ (unit/, e2e/)
├─ scripts/                  # seed-dev-users, driver-simulator.ts
├─ .env.example  .env.local (never committed)
├─ .github/workflows/ci.yml
└─ README.md
```

## 4. Authentication & Authorisation
1. **Clerk** manages identity. `middleware.ts` uses `clerkMiddleware` + `createRouteMatcher`: public routes allowed, everything else requires session; role-prefixed routes require matching `sessionClaims.metadata.role`.
2. Configure Clerk session token to include `{ "metadata": "{{user.public_metadata}}" }` so role is available without API calls.
3. **Source of role:** Clerk `publicMetadata.role` ∈ `rider | driver | admin`. Set by `POST /api/onboarding/role` (server verifies user has no role yet; never allows self-assigning `admin`).
4. Helpers: `getCurrentUser()`, `requireUser()`, `requireRole('driver')` → throw `AppError(401/403)`. **Every route handler begins with one of these.**
5. **Supabase access model (pick A; fall back to B only if A is blocked):**
   - **A (preferred):** Clerk ↔ Supabase *third-party auth integration* (Supabase accepts Clerk JWTs). Browser client uses `accessToken: () => clerk.session.getToken()`. RLS policies use `auth.jwt()->>'sub'` (= Clerk user id). Used for **reads and realtime subscriptions**.
   - **B (fallback):** Browser has no direct DB access; server emits realtime updates through Supabase **Broadcast** on private channels `ride:{id}` after each mutation, authorised by server-signed channel tokens.
   - **All writes go through route handlers using the service-role client** after explicit authorisation checks (never expose service key to the browser). RLS is still enabled as defence in depth.
   - *The agent must read the current official Clerk and Supabase docs before implementing the integration, because setup steps change.*
6. Admin accounts: promote by setting `publicMetadata.role = "admin"` in Clerk dashboard (documented in `docs/SETUP.md`).

## 5. Ride State Machine (`lib/rides/state-machine.ts`)
Allowed transitions (anything else → `409 INVALID_TRANSITION`):
```
requested → accepted | cancelled | expired
accepted  → arrived | cancelled | requested (driver cancel → re-match)
arrived   → in_progress | cancelled
in_progress → completed
```
Each transition: (1) verifies actor role/ownership, (2) updates row with `WHERE status = <expected>` (optimistic concurrency), (3) inserts `ride_events`, (4) creates notifications, (5) returns updated ride. Implemented as a single Postgres function/RPC where atomicity matters (accept).

## 6. Matching Algorithm (`lib/rides/matching.ts` + SQL RPC)
1. `find_nearby_drivers(pickup geography, ride_type text, radius_m int, exclude uuid[])` returns online, approved, `is_busy = false`, last location update < 60 s, ordered by distance.
2. Create up to 5 `ride_offers` (expires 30 s). Notify drivers via Realtime (`ride_offers` INSERT filtered by driver id).
3. `accept_ride(ride_id, driver_id)` RPC: lock row (`FOR UPDATE`), verify `status='requested'` and driver has valid pending offer, set `driver_id`, `status='accepted'`, `accepted_at`, mark driver busy, mark other offers `cancelled`.
4. Expiry job (`pg_cron` every minute → function `expire_stale_offers_and_rides()`): expire offers; if no pending offers and rounds < 3, widen radius and create next batch (via `net.http_post` to `/api/internal/matching/tick` with secret **or** do the batching inside SQL); if ride older than 120 s → `expired`.
   *Vercel Hobby cron is daily only — do NOT rely on Vercel Cron for this.*

## 7. Real-time Design
| Channel | Mechanism | Consumers |
|---|---|---|
| Ride row changes | `postgres_changes` on `rides` filtered `id=eq.{id}` | Rider + driver ride screens |
| Offers | `postgres_changes` on `ride_offers` filtered `driver_id=eq.{me}` | Driver dashboard |
| Notifications | `postgres_changes` on `notifications` filtered `user_id=eq.{me}` | Bell + toasts |
| Driver location | **Broadcast** channel `ride:{id}:loc` (driver publishes every 3–5 s during active ride); also `PUT /api/driver/location` every 5–10 s to persist to `driver_profiles.current_location` for matching | Rider tracking map |
| SOS alerts | `postgres_changes` on `sos_events` (admin only) | Admin shell |
Hooks must handle reconnect (resubscribe + refetch), cleanup on unmount, and fall back to polling every 5 s if the socket is down.

## 8. Fare Calculation (`lib/pricing`)
Pure functions, 100 % unit-tested: `calculateFare({rideType, distanceM, durationS, surge, promo, bookingFee}) → {baseFare, distanceFare, timeFare, surgeAmount, discount, bookingFee, total}` in paise, with rounding to nearest ₹1 (100 paise) at the total. Server recomputes fare on `POST /api/rides` from `quote_id` (signed quote stored in `fare_quotes` table, 5-min TTL) — **never trust client-sent amounts.** Final fare on completion = quoted fare unless actual distance exceeds quoted by > 20 % (then recalculated using actual distance/time, capped at 1.5× quote).

## 9. Payments Architecture
- `PaymentProvider` interface: `createCustomer`, `createSetupIntent`, `listPaymentMethods`, `detachPaymentMethod`, `createPaymentIntent`, `refund`, `verifyWebhook`. `StripeProvider` implements it.
- Amounts in **paise** (`currency: 'inr'`). Always send `idempotencyKey` (`ride:{id}:pay`).
- Webhook handler: verify signature using raw body (`await req.text()`), check `stripe_events` for duplicate id, process, store. Always return 200 quickly after persisting; heavy work (email) after.
- Stripe metadata: `ride_id`, `rider_id`.
- Driver earnings: on `payment succeeded` or cash confirmed → insert `driver_earnings` (`gross`, `commission`, `net`, `status='pending'`). Admin "Mark paid out" (manual) in v1.
- PCI: card data never touches our servers (Payment Element only).

## 10. Security Checklist (must pass before deploy)
- [ ] Zod validation on every API input; reject unknown fields (`.strict()`).
- [ ] AuthN + AuthZ check at the top of every handler; ownership checks (e.g., rider can only read own rides).
- [ ] RLS enabled on all tables with policies from doc 04; tested with negative cases.
- [ ] Secrets only in env vars; `NEXT_PUBLIC_*` contains only public keys; env validated at boot (`lib/env.ts`).
- [ ] Webhook signatures verified (Stripe via `stripe.webhooks.constructEvent`, Clerk via `svix`).
- [ ] Rate limits: `/api/rides` (5/min), `/api/promo/validate` (10/min), `/api/support/*` (10/min), SOS (3/min), auth-adjacent endpoints.
- [ ] Security headers in `next.config` (CSP allowing Clerk, Stripe, Google Maps, Supabase; HSTS; X-Content-Type-Options; Referrer-Policy; frame-ancestors).
- [ ] Google Maps browser key restricted by HTTP referrer + API; server key restricted by API (and IP if possible).
- [ ] File uploads: type/size validation, random filenames, private buckets for documents with signed URLs.
- [ ] Output encoding (React default), no `dangerouslySetInnerHTML` with user content.
- [ ] Ride OTP: 4 digits, stored hashed? (store plain with short life is acceptable) — max 5 attempts then ride flagged.
- [ ] Logging excludes tokens, card data, full phone numbers.
- [ ] `npm audit`/`pnpm audit` clean of high/critical.
- [ ] CORS not widened; API only same-origin.
- [ ] SOS public token: ≥ 32 bytes random, expires 6 h, read-only, minimal data.

## 11. Error Handling & Logging
Custom `AppError(code, status, message, details?)`. All handlers wrapped by `withApi(handler, {auth, schema, rateLimit})` which returns the standard envelope (doc 05). Client shows toast from `message`; never raw errors. Use `logger.info/warn/error` (pino or console JSON) with request id.

## 12. Environment Variables (`.env.example` must include all, with comments)
```
# App
NEXT_PUBLIC_APP_NAME=Ridely
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=      # browser key (referrer-restricted)
GOOGLE_MAPS_SERVER_API_KEY=           # server key (Routes/Geocoding)
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=       # optional styled map id
# Email
RESEND_API_KEY=
EMAIL_FROM="Ridely <onboarding@resend.dev>"
# Rate limit (optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# Business config
DEFAULT_MAP_CENTER_LAT=19.0760
DEFAULT_MAP_CENTER_LNG=72.8777
MAX_RIDE_DISTANCE_KM=100
PLATFORM_COMMISSION_PERCENT=20
CANCELLATION_FEE_PAISE=3000
BOOKING_FEE_PAISE=500
SMS_ENABLED=false
INTERNAL_CRON_SECRET=                 # random string, used by DB cron → API
# Optional
SENTRY_DSN=
```
Business config values are defaults; runtime values live in `app_settings` (editable by admin).

## 13. Coding Standards
- TypeScript strict, no `any` (use `unknown` + narrowing). Generated Supabase types in `src/types/database.ts` (`supabase gen types`).
- Server code never imported into client components (`import 'server-only'`).
- Components: small, typed props, co-located tests for logic-heavy ones. Prefer server components; add `'use client'` only when needed.
- Naming: files kebab-case, components PascalCase, DB snake_case, API JSON camelCase (map at boundary).
- Money in paise integers; times in UTC ISO strings; display in `Asia/Kolkata`.
- Conventional commits (`feat:`, `fix:`, `chore:`), small commits per task, `main` always deployable.
- No dead code, no TODOs without an entry in `docs/PROGRESS.md`.
- Each service function has JSDoc stating inputs/outputs/errors.

## 14. Testing Strategy
| Level | Scope | Minimum |
|---|---|---|
| Unit (Vitest) | fare calculator, surge, promo validator, state machine, OTP, geo utils, Zod schemas | ≥ 90 % of `lib/pricing`, `lib/rides` |
| Integration | route handlers with mocked Clerk/Stripe + test DB (Supabase local) | each endpoint: success, validation error, 401, 403 |
| RLS tests | SQL or script verifying rider A cannot read rider B's rides etc. | all tables with user data |
| E2E (Playwright) | rider+driver full loop using two browser contexts; cancel; promo; payment with Stripe test card; SOS | 6 core scenarios |
| Manual | responsive pass, a11y (axe), Lighthouse | before release |
**Dev tooling:** `scripts/driver-simulator.ts` moves a fake driver along a route (so a single developer can test tracking without a second device) and a seed script creating test rider/driver/admin accounts.

## 15. Deployment
- **Environments:** local (Supabase CLI), preview (Vercel PR previews with Supabase *dev* project), production.
- Steps: create Supabase prod project → run migrations → enable PostGIS/pg_cron/pg_net → configure Clerk production instance (requires a domain) → set Vercel env vars → set webhooks (Stripe, Clerk) to the production URL → restrict Maps keys to prod domain → smoke test → enable monitoring.
- Rollback: Vercel instant rollback; DB migrations must be backwards compatible (expand/contract).
- CI: GitHub Actions runs `pnpm lint && pnpm typecheck && pnpm test && pnpm build` on every PR.

## 16. Third-party Cost & Quota Notes (for the owner)
Google Maps requires a billing account (card) even for the free monthly credit; set budget alerts. Stripe test mode is free. Supabase/Vercel/Clerk/Resend free tiers suffice for development. Resend without a verified domain can only send to your own account email — fine for dev, domain verification needed for production.
