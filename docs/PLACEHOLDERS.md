# Placeholders & Configurable Assets (PLACEHOLDERS.md)

1. **Branding:**
   - App Name: `Ridely` (overridable via `NEXT_PUBLIC_APP_NAME`).
   - Logo: Dynamic SVG brand mark in `components/layout/brand-logo.tsx`.
2. **External Keys Fallback:**
   - Google Maps: Simulated route & coordinates using Mumbai landmarks when keys are omitted.
   - Stripe: Integrated test card simulator (`4242 4242 4242 4242`) and Stripe elements bridge.
   - Clerk: Dev switcher allows one-click switching between `rider@ridely.local`, `driver@ridely.local`, and `admin@ridely.local`.
   - Resend: Development email logger logs receipts to console and displays in UI notification center.

