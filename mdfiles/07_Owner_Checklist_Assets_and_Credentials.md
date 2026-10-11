# 07 — Owner Checklist: Everything You Need To Provide

**Rule for the AI agent:** request each item at the stage listed ("Needed at"), say exactly what it is, why it is needed, and where to put it. Never ask for an item earlier than needed unless it blocks work. **Never ask the owner to paste secrets into chat** — secrets go into `.env.local` only (the agent creates the file with empty keys and the owner fills it in). Never commit `.env.local`.

Legend: 🔴 required to proceed · 🟡 recommended · 🟢 optional

## A. Decisions (answer in Phase 0)
| # | Item | Why | Default if not answered |
|---|---|---|---|
| A1 🔴 | App/brand name | Titles, emails, receipts | Ridely |
| A2 🔴 | Country, currency, launch city | Fares, map centre, phone format | India, INR, Mumbai |
| A3 🟡 | Brand colours | Theme tokens | Emerald/ink palette in doc 02 |
| A4 🟡 | Support email | Footer, tickets, emails | `support@example.com` placeholder |
| A5 🟡 | Cash payments allowed? | Payment flow | Yes |
| A6 🟡 | Commission % and cancellation fee | Driver earnings, fees | 20 %, ₹30 |
| A7 🟢 | Domain name | Clerk production, email domain | Use `*.vercel.app` |

## B. Accounts & Credentials (by phase)

### Phase 1 — Clerk (authentication) 🔴
1. Create account at clerk.com → create application → enable **Email** and **Google** sign-in.
2. Copy **Publishable key** and **Secret key** → `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
3. Agent will give exact steps to add the session-token claim `{"metadata": "{{user.public_metadata}}"}`.
4. To create your **admin** account: sign up normally, then in Clerk dashboard → Users → your user → Public metadata → `{"role":"admin"}`.
*Why:* login, roles, route protection.

### Phase 2 — Supabase (database, realtime, storage) 🔴
1. Create account at supabase.com → New project (choose region near you, e.g., Mumbai `ap-south-1`) → save the **database password** in a password manager.
2. Settings → API: copy **Project URL**, **anon key**, **service_role key** → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. (service_role is secret — never expose.)
3. Settings → Database: copy connection string → `SUPABASE_DB_URL`.
4. Database → Extensions: enable **postgis**, **pg_cron**, **pg_net** (agent confirms).
5. Authentication → Third-party → add **Clerk** (agent gives current steps).
6. Clerk dashboard → Webhooks → add endpoint (URL from agent; for local dev use tunnel) → copy **Signing secret** → `CLERK_WEBHOOK_SIGNING_SECRET`.
*Why:* all data, realtime ride updates, file storage.

### Phase 4 — Google Maps Platform 🔴
1. console.cloud.google.com → create project → **attach billing account** (card needed; free monthly credit applies; set a **budget alert** e.g. ₹500).
2. Enable APIs: **Maps JavaScript API, Places API (New), Routes API, Geocoding API**.
3. Create **two API keys**: (a) Browser key → restrict to HTTP referrers `http://localhost:3000/*` (+ production domain later) and the Maps JS + Places APIs → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; (b) Server key → restrict to Routes + Geocoding APIs → `GOOGLE_MAPS_SERVER_API_KEY`.
4. 🟢 Create a Map ID (cloud-based styling) → `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.
*Why:* maps, address search, routes, distance/ETA, fares.

### Phase 5 — Internal secret 🔴
Agent generates a random `INTERNAL_CRON_SECRET`; you paste it in `.env.local` and (agent shows where) in Supabase for the cron job.

### Phase 8 — Stripe (payments) 🔴
1. Create account at stripe.com → stay in **Test mode** (toggle top-right).
2. Developers → API keys: copy **Publishable** and **Secret** test keys → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`.
3. Install **Stripe CLI** (agent gives OS-specific instructions) → run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → copy printed `whsec_…` → `STRIPE_WEBHOOK_SECRET`.
4. Tell the agent your country: Stripe **live** payments in India have restrictions and may not be available to you; test mode works fully for this project. If you later need live Indian payments, ask the agent to add a Razorpay adapter.
Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (declined), any future expiry, any CVC.
*Why:* card payments, saved cards, refunds.

### Phase 9 — Resend (email) 🟡 (needed for receipts/SOS/ticket emails)
1. resend.com → create API key → `RESEND_API_KEY`.
2. Without a verified domain, emails send only to the email you registered with (`EMAIL_FROM="Ridely <onboarding@resend.dev>"`). To email anyone: verify a domain (needs A7).
*Why:* receipts, SOS alerts, driver approval, ticket replies.

### Phase 10 — Optional integrations 🟢
| Item | Why | Default |
|---|---|---|
| Twilio SID/token/number | SMS for SOS | disabled (`SMS_ENABLED=false`); email + in-app only |
| Upstash Redis URL/token | Production rate limiting | in-memory limiter in dev |
| Sentry DSN | Error tracking | console logging |

### Phase 14 — Deployment 🔴/🟡
| Item | Needed? | Notes |
|---|---|---|
| GitHub account + repo | 🔴 | Vercel deploys from it |
| Vercel account | 🔴 | Import repo; agent lists env vars to paste |
| Production Supabase project | 🔴 | Separate from dev recommended |
| Domain name | 🟡 | Required for Clerk **production** instance; else demo on vercel.app with dev instance |
| Production keys (Clerk/Stripe/Maps/Resend) | 🔴 | Maps key referrer restriction → prod domain |

## C. Content & Assets (needed in Phase 1 and Phase 12; placeholders are used until supplied)
| Asset | Format / spec | Where to put | Needed at | Default |
|---|---|---|---|---|
| Logo (light & dark) | SVG preferred, PNG ≥ 512 px, transparent | `/public/brand/` | P1/P12 | Text logo |
| Favicon / app icon | 512×512 PNG | `/public/brand/icon.png` | P12 | Generated |
| Hero image or short video | JPG/WebP ≥ 1920 px, video MP4 ≤ 8 MB | `/public/brand/hero.*` | P12 | Gradient + illustration |
| Ride type icons (5) | SVG/PNG | `/public/icons/rides/` | P4 | lucide icons |
| Landing copy (headline, taglines, how-it-works text) | Text/Doc | `/docs/content/` | P12 | AI-written draft |
| FAQ (12+ Q&A) | Text | `/docs/content/faq.md` | P10 | AI-written draft |
| Terms & Privacy text | Text (legal review!) | `/docs/content/` | P12/P14 | Marked templates |
| Company name/address/GSTIN (receipts) | Text | `.env`/admin settings | P9 | Omitted |
| Sample driver photos (for demo seed) | JPG | `/public/demo/` | P5 | Initials avatars |

## D. Test Data You Will Create During Development
- 1 admin (your account), 1 rider and 1 driver account (use Gmail `+` aliases, e.g. `you+rider@gmail.com`, `you+driver@gmail.com`), test locations around Mumbai, Stripe test cards.

## E. Final Pre-Launch Confirmation (Phase 14)
- [ ] All keys rotated/new for production · [ ] Legal pages reviewed · [ ] Maps budget alert on · [ ] Stripe still in test mode (or live approved) · [ ] Backups: Supabase daily backups understood · [ ] Admin account secured with 2FA
