# Owner Setup Guide (SETUP.md)

## 1. Quick Start
```bash
cd my-app
pnpm install
pnpm dev
```
Open `http://localhost:3000`.

## 2. Environment Variables (.env.local)
Copy `.env.example` to `.env.local` to enable external production services:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SERVER_API_KEY`
- `RESEND_API_KEY`

