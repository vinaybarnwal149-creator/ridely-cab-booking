# 08 — Step-by-Step Guide: How YOU Proceed With Antigravity

## Step 0 — Prepare your computer (30–60 min)
Install: **Node.js 20+**, **pnpm** (`npm i -g pnpm`), **Git**, **Google Antigravity**. Optional but recommended: **Docker Desktop** (local Supabase), **Supabase CLI**, **Stripe CLI**. Create a GitHub account.

## Step 1 — Create the project folder
1. Create an empty folder, e.g. `ridely`, and open it as the workspace in Antigravity.
2. Inside it create a folder `docs/` and copy in documents `01`–`08` from this package (Antigravity can also take them as uploaded attachments — doing both is safest, because files in the workspace stay available in every session).
3. Keep file names unchanged; the master prompt refers to them.

## Step 2 — Create accounts (do it as the agent asks, phase by phase)
You do **not** need everything on day one. For the first run you need only: **Clerk** account. The agent will ask for the rest at the right time (see doc 07).

## Step 3 — Paste the master prompt
Paste it into Antigravity's agent chat (use the strongest/planning-capable model available; if Antigravity offers a planning mode, use it for Phase 0). The agent will:
1. Read all docs, write `docs/PLAN_ACK.md` with its understanding and any questions.
2. Pause for your answers on the few Phase 0 decisions (name, city, currency — defaults exist).
3. Scaffold the app and proceed phase by phase.

## Step 4 — Your role during development
| When the agent says… | You do… |
|---|---|
| "🔑 I need: X" | Create/copy X as instructed, put it in `.env.local`, reply "done" (never paste secrets in chat) |
| "🖼️ Asset needed" | Drop the file in the given folder, or reply "use placeholder" |
| "❓ Decision" with options | Reply with the option number; the agent already recommends one |
| "✅ Phase N complete — please verify" | Run `pnpm dev`, follow the listed test steps, report problems or say "approved" |

Review `docs/PROGRESS.md` any time to see what is done/pending/blocked.

## Step 5 — How to test (two-user testing)
- **Rider:** normal browser window → `http://localhost:3000`, sign up with `you+rider@gmail.com`.
- **Driver:** a different browser profile or **Incognito** window, sign up with `you+driver@gmail.com`, choose Driver, submit application.
- **Admin:** your main account promoted in Clerk (doc 07 B). Approve the driver at `/admin/drivers`.
- Allow browser location in the driver window (or use the **driver simulator**: `pnpm sim:driver` — agent builds it in Phase 5).
- Run the full loop: request ride → driver accepts → arrived → OTP start → complete → pay with `4242…` → rate → download receipt.
- Test cancellations, promo `WELCOME50`, multi-stop, SOS (add an emergency contact with your own email first).

## Step 6 — Phase-by-phase overview
| Phase | What gets built | You provide |
|---|---|---|
| 0 | Plan & questions | Name/city/currency answers |
| 1 | Project, auth, layouts | Clerk keys |
| 2 | Database, RLS, backend base | Supabase keys, webhook secret |
| 3 | Profiles, driver onboarding | — |
| 4 | Maps, fare estimate, booking | Google Maps keys |
| 5 | Driver dashboard & matching | Internal secret |
| 6 | Realtime tracking & notifications | — |
| 7 | Test checkpoint | Manual testing |
| 8 | Stripe payments, earnings | Stripe test keys + CLI |
| 9 | History, PDF receipts, email | Resend key |
| 10 | Ratings, promos, SOS, support | Support email (optional Twilio) |
| 11 | Admin panel | — |
| 12 | UI polish, a11y, SEO | Logo, images, copy |
| 13 | Security, performance, QA | Upstash/Sentry (optional) |
| 14 | Deploy to Vercel + Supabase prod | GitHub, Vercel, domain (optional) |

## Step 7 — Deployment (Phase 14, agent guides you)
1. Push code to GitHub. 2. Create production Supabase project; agent runs migrations. 3. Import repo in Vercel; paste env vars. 4. Update Clerk/Stripe webhook URLs to the deployed domain. 5. Restrict Google Maps browser key to the deployed domain. 6. Smoke-test full flow on production. 7. Share the URL.

## Troubleshooting Quick Reference
| Problem | Likely cause / fix |
|---|---|
| Map blank | Maps key missing/restricted wrongly; APIs not enabled; billing not attached |
| Can't sign in after role change | Sign out/in to refresh session token claims |
| Realtime updates don't arrive | Table not in Realtime publication, or Clerk↔Supabase integration not configured; check fallback B |
| Stripe webhook 400 | Wrong `STRIPE_WEBHOOK_SECRET` or body parsed before verification |
| Emails not received | Resend sandbox sends only to your account email; check spam |
| Offers never expire | pg_cron/pg_net not enabled or `INTERNAL_CRON_SECRET` mismatch |
| Geolocation fails | Needs HTTPS or localhost; permission denied in browser settings |

## Good habits
Commit after every phase; keep `.env.local` out of Git; set Google Cloud budget alerts; test in a phone-size window (DevTools) at every phase; ask the agent to update `PROGRESS.md` if it looks stale.
