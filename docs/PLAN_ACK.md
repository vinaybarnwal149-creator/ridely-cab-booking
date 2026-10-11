# Plan Acknowledgement & Analysis (PLAN_ACK)

## 1. Project Understanding
- **App Name:** Ridely (configurable via `NEXT_PUBLIC_APP_NAME`, default "Ridely")
- **Domain:** Mobile-first Ride-Hailing SaaS ("Uber clone")
- **Target Region:** India (Default coordinates: Mumbai 19.0760, 72.8777; Currency: INR / Paise; Timezone: Asia/Kolkata; Phone: +91)
- **Roles:** Rider, Driver, Admin
- **Core Loop:** Auth & Role Onboarding -> Place Autocomplete & Multi-stop -> Live Route & Fare Quote -> Request & Atomic Driver Match -> Driver Online / Accept / Arrive -> OTP Start -> Navigation & SOS -> Complete -> Stripe / Cash Payment -> 1-5 Star Rating & Review -> PDF & Email Receipt -> Full History & Admin Control.

## 2. Architecture & Design Principles
- **Dual-Mode System:** Live integrations (Clerk, Supabase, Stripe, Google Maps, Resend) with built-in zero-config dev simulator / mock mode so the application runs immediately without breaking if third-party API keys are unset.
- **State Machine Integrity:** Strict server-validated ride transitions (`requested` -> `accepted` -> `arrived` -> `in_progress` -> `completed` / `cancelled`).
- **Precision Financials:** Stored in integer paise (1 INR = 100 paise) to prevent floating-point rounding inaccuracies.
- **Security & Safety:** 4-digit ride OTP verification before ride start, 2-step confirm SOS emergency broadcast with public tracker link (`/sos/[token]`), strict Zod validation, and role-based route protection.

