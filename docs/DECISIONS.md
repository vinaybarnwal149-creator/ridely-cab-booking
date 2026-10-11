# Architectural & Design Decisions (DECISIONS.md)

1. **Framework & Engine:** Next.js 16 (App Router) + React 19 + TypeScript.
2. **Dual Database & Auth Adapter:**
   - To make the SaaS testable and runnable out-of-the-box (even without external Supabase or Clerk credentials initially configured), an in-memory/JSON state engine with Supabase client bindings is provided.
   - When `NEXT_PUBLIC_SUPABASE_URL` is set, calls use Supabase; otherwise, the resilient built-in dev store maintains state across sessions.
   - When Clerk keys are provided, Clerk handles authentication; otherwise, an interactive dev auth switcher is enabled for instant switching between Rider, Driver, and Admin personas.
3. **Interactive Maps:** Built with responsive canvas / interactive vector map UI with OpenStreetMap / Google Maps hybrid adapter, ensuring beautiful route rendering and pin animation regardless of API key presence.
4. **Financial Unit:** All monetary amounts are handled strictly as integer paise (`totalFarePaise`, `baseFarePaise`, etc.) and rendered via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

