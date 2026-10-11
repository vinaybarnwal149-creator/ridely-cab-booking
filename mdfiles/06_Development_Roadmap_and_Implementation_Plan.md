# 06 — Development Roadmap & Implementation Plan

Phases are sequential. A phase is **done** only when its *Definition of Done (DoD)* passes: code compiles (`pnpm typecheck`), lint clean, tests for that phase pass, feature manually verified in the browser, and `docs/PROGRESS.md` updated. Each phase lists **Owner input needed** — the agent must request it at the START of the phase (or earlier if it blocks), stating exactly what, why, and where to put it. If the owner has not supplied an item, the agent proceeds with a documented placeholder/mock where possible (flagged in `docs/PLACEHOLDERS.md`) and continues with unblocked work.

Time estimates assume focused work; the original 14-day plan maps to these phases.

---

## Phase 0 — Analysis & Planning (Day 0)
**Agent tasks**
1. Read all docs in `/docs`. Produce `docs/PLAN_ACK.md`: summary of understanding, list of ambiguities/risks, and confirmed assumptions.
2. Create `docs/PROGRESS.md` (checklist of every phase/task below, with status), `docs/DECISIONS.md`, `docs/PLACEHOLDERS.md`, `docs/SETUP.md`.
3. Verify local tooling (Node ≥ 20, pnpm, git, Supabase CLI, Docker for local Supabase — optional) and report anything missing.
**Owner input needed:** confirm app name (default Ridely), country/currency (default India/INR), city centre; confirm tooling installed; answer any open questions in `PLAN_ACK.md`.
**DoD:** `PLAN_ACK.md` reviewed by owner.

## Phase 1 — Project Setup & Authentication (Day 1)
**Tasks:** scaffold Next.js 15 TS app with pnpm; Tailwind v4; shadcn/ui; ESLint/Prettier/Husky; folder structure (doc 03 §3); `lib/env.ts` Zod env validation; `.env.example`; Clerk integration (`ClerkProvider`, sign-in/up pages, `middleware.ts` route protection); onboarding role page + `POST /api/onboarding/role`; Clerk webhook → `profiles` (needs DB — stub until Phase 2, then wire); role-based redirects; base layouts (public, rider, driver, admin shells); design tokens; landing page skeleton; GitHub Actions CI.
**Owner input needed:** Clerk publishable + secret keys (create Clerk app, enable Email + Google; configure session token claim `metadata` — agent provides exact steps in `SETUP.md`); GitHub repo (optional); logo/brand assets (optional).
**DoD:** can sign up, pick role, land on correct (empty) dashboard; unauthorised role access blocked; CI green.

## Phase 2 — Database & Backend Foundation (Day 2)
**Tasks:** Supabase project/local setup; migrations 001–009 per doc 04; RLS policies; functions/RPCs; seed; generate TS types; Supabase server + browser clients; Clerk↔Supabase auth integration (or fallback B); wire Clerk webhook to upsert profiles; `withApi` wrapper, `AppError`, logger, rate-limit helper; `/api/health`, `/api/me`; RLS test script.
**Owner input needed:** Supabase project URL, anon key, service-role key, DB connection string (Settings → API / Database); confirm PostGIS + pg_cron + pg_net enabled (agent gives steps); Clerk webhook signing secret (agent gives webhook URL; local dev uses a tunnel like `ngrok`/Clerk CLI — agent explains).
**DoD:** migrations apply from scratch; new Clerk user appears in `profiles`; RLS tests pass; `/api/me` works.

## Phase 3 — Profiles & Dashboards (Day 3)
**Tasks:** profile page (personal info, avatar upload to Storage), emergency contacts CRUD, preferences; rider dashboard; driver onboarding stepper + pending page + `PUT/GET /api/driver/application`; admin driver approval (minimal list + approve/reject so drivers can proceed); notifications table + bell (basic).
**Owner input needed:** none new (Storage buckets created via migration). Optional: sample avatar.
**DoD:** rider edits profile + avatar; driver submits application; admin approves; approved driver reaches driver dashboard.

## Phase 4 — Maps, Fare Estimation & Booking (Days 4)
**Tasks:** `MapView`, `PlaceAutocomplete` (Places API New), geolocation hook; `lib/maps/routes.ts` (Routes API server-side); `lib/pricing` (fare, surge, promo) with unit tests; `POST /api/fare/estimate`, `fare_quotes`; `/book` page (steps 1–3, multi-stop UI up to 3, promo apply, payment method choice); `POST /api/rides` with OTP, active-ride guard; ride tracking skeleton `/rides/[id]` (requested state, cancel).
**Owner input needed:** **Google Maps keys** — one browser key (HTTP referrer restricted) and one server key; APIs to enable: Maps JavaScript, Places API (New), Routes API, Geocoding; billing account attached (agent gives click-by-click steps).
**DoD:** rider can enter locations, see route + fares for all ride types, apply `WELCOME50`, and create a ride in `requested` state; unit tests for pricing pass.

## Phase 5 — Driver Dashboard & Matching (Day 5)
**Tasks:** online toggle + location publishing (`useDriverLocation`); `find_nearby_drivers`, `accept_ride` RPC; offers creation; driver offer UI with countdown; accept/decline; lifecycle endpoints (arrived/start with OTP/complete); `ride_events`; cancellation rules & fees; matching tick endpoint + pg_cron job; driver active-ride screen; **driver simulator script** + seed drivers.
**Owner input needed:** `INTERNAL_CRON_SECRET` (agent generates; owner adds to env and DB setting); public URL for pg_net → local dev uses polling tick or tunnel (agent explains).
**DoD:** two browsers (rider + driver) can complete request → accept → arrived → start → complete; race test: two drivers accept simultaneously → exactly one wins; expiry works.

## Phase 6 — Real-time Updates & Notifications (Day 6)
**Tasks:** `useRideRealtime`, `useNotifications`; Broadcast driver location + animated marker; ETA endpoint & updates; toasts; reconnect/polling fallback; notification bell + list page; transactional notifications for all events.
**Owner input needed:** none (enable Realtime on tables via migration).
**DoD:** rider sees status and driver movement update without refresh; killing network and restoring recovers state.

## Phase 7 — Testing Checkpoint (Day 7 — buffer)
**Tasks:** fix bugs; integration tests for ride endpoints (401/403/409/422 cases); E2E rider+driver happy path with Playwright (two contexts); review security checklist items so far; update docs.
**DoD:** all tests green; `PROGRESS.md` accurate.

## Phase 8 — Payments (Day 8)
**Tasks:** `PaymentProvider` + Stripe implementation; customer creation; saved cards (SetupIntent + Payment Element) in profile and `/rides/[id]/pay`; PaymentIntent flow; cash flow with driver confirmation; webhook with idempotency; driver earnings ledger & commission; refund (admin); failed payment/retry; unpaid-ride booking block; Stripe CLI local webhook instructions.
**Owner input needed:** Stripe **test** publishable + secret key; webhook signing secret (from Stripe CLI `stripe listen` in dev / dashboard endpoint in prod); confirmation whether a live Stripe account in India is available (otherwise stays test mode); decide cash support (default yes).
**DoD:** pay with test card `4242…` → webhook → payment succeeded, earning created, receipt number set; declined card `4000 0000 0000 0002` shows error + retry; webhook replay is a no-op.

## Phase 9 — History & Receipts (Day 9)
**Tasks:** `/history` list + filters + pagination (rider and driver); detail page with static map route; PDF receipt (`@react-pdf/renderer`) endpoint; email receipt via Resend + React Email template; auto-email on payment success.
**Owner input needed:** Resend API key; `EMAIL_FROM` (dev uses `onboarding@resend.dev`, which only delivers to the account owner's email — for other recipients a verified domain is needed); company name/address/GSTIN (optional) for receipt footer.
**DoD:** PDF opens with correct data; email arrives; non-participants get 403.

## Phase 10 — Ratings, Promos, SOS, Support (Days 10–11)
**Tasks:** rating UI + API + trigger-based averages + driver reviews list; promo redemption on completion & admin CRUD; SOS flow + public tracker page + emails + admin alert; support tickets (user + admin) with attachments; FAQ/help content.
**Owner input needed:** support email address; FAQ/legal copy (else templates); optional Twilio credentials for SMS (default disabled — India SMS requires DLT registration).
**DoD:** all 13 use cases verified against the PRD matrix.

## Phase 11 — Admin Panel Completion (Day 11)
**Tasks:** overview KPIs/charts, users, rides, pricing & settings, promos, tickets, SOS, earnings payouts marker.
**DoD:** admin can perform every action in PRD §4.13.

## Phase 12 — UI Polish, Responsiveness, Accessibility (Day 12)
**Tasks:** responsive audit 360/768/1024/1440; skeletons/empty/error states everywhere; a11y pass (axe); micro-interactions; SEO metadata, OG image, favicon, `robots.txt`, `sitemap.xml`; replace placeholders with owner assets; Lighthouse ≥ 85.
**Owner input needed:** final logo/brand assets, hero imagery, copy review.

## Phase 13 — Security, Performance & Final QA (Day 13)
**Tasks:** walk through the doc 03 §10 checklist and tick every item; add security headers/CSP; rate limits (Upstash); query/index review (`EXPLAIN` on matching & history); bundle analysis; full E2E suite; dependency audit; error tracking (optional); fix remaining bugs.
**Owner input needed:** Upstash Redis URL/token (optional, recommended); Sentry DSN (optional).
**DoD:** checklist 100 % ticked; E2E green; no high/critical audit findings.

## Phase 14 — Deployment & Launch (Day 14)
**Tasks:** Supabase production project + migrations; Vercel project + env vars; Clerk production instance (custom domain required) or continue with dev instance on a `*.vercel.app` URL for demo; Stripe/Clerk webhooks pointed to production; restrict Maps keys to prod domain; pg_cron secret/URL update; smoke tests on production; README (setup, env, scripts, architecture diagram, screenshots), `docs/USER_GUIDE.md`, final `PROGRESS.md`.
**Owner input needed:** Vercel account/GitHub repo access; **domain name** (optional but required for Clerk production instance & email domain verification); production keys for all services; decision on going live vs demo mode.
**DoD:** production URL works for full rider+driver flow with Stripe test payments; docs complete.

---

## Cross-cutting Rules for Every Phase
1. **Plan → build → test → verify → record.** Before coding a phase, post a short plan; after, post what was built, how it was tested, and what remains.
2. Update `docs/PROGRESS.md` (✅ done / 🔄 in progress / ⏳ pending / ⛔ blocked-on-owner) after every task.
3. Never mark done with failing tests or console errors.
4. Don't expand scope; log ideas in `docs/BACKLOG.md`.
5. If a requirement conflicts with reality (API change, service limitation), explain, propose the best alternative with reasoning, and record in `DECISIONS.md` — ask the owner only if the choice changes cost, product behaviour, or requires credentials.
6. Verify third-party setup steps against current official documentation (Clerk, Supabase, Stripe, Google Maps change often).
7. Keep commits small and conventional; keep `main` deployable.

## Risk Register
| Risk | Impact | Mitigation |
|---|---|---|
| Stripe unavailable for Indian live accounts | Can't take real payments | Test mode for v1; provider abstraction; cash option; Razorpay adapter as future work |
| Google Maps billing/quotas | Map breaks / surprise cost | Budget alerts, debounce autocomplete, cache routes/ETA, session tokens for Places |
| Realtime scale/limits on free tier | Delayed updates | Throttle location (3–5 s), polling fallback |
| Clerk↔Supabase JWT integration friction | Realtime auth fails | Fallback B (server Broadcast) documented |
| Vercel Hobby cron limits | Offers don't expire | Use Supabase pg_cron |
| Resend sandbox restrictions | Emails not delivered to others | Verify domain before launch |
| Geolocation denied/unavailable | Cannot set pickup | Manual address entry; clear guidance |
| Two-person testing difficulty | Slow QA | Driver simulator + seed accounts + incognito window guide |
