# 05 — API Documentation

Base path: `/api`. Implemented as Next.js Route Handlers. JSON in/out (camelCase). All money in **paise**. Times ISO-8601 UTC. Every handler: authenticate → authorise → rate-limit (where marked) → validate with Zod (`.strict()`) → call a service in `lib/services` → return envelope.

## 1. Conventions

**Success:** `{ "ok": true, "data": { ... } }` (lists add `"meta": { "page": 1, "pageSize": 10, "total": 42 }`)
**Error:** `{ "ok": false, "error": { "code": "RIDE_UNAVAILABLE", "message": "Human readable", "details": {...} } }`

| HTTP | When | Common codes |
|---|---|---|
| 400 | Validation failure | `VALIDATION_ERROR` (details = field errors) |
| 401 | Not signed in | `UNAUTHENTICATED` |
| 403 | Wrong role / not owner / suspended | `FORBIDDEN`, `ACCOUNT_SUSPENDED`, `DRIVER_NOT_APPROVED` |
| 404 | Not found | `NOT_FOUND` |
| 409 | State conflict | `INVALID_TRANSITION`, `RIDE_UNAVAILABLE`, `ACTIVE_RIDE_EXISTS`, `QUOTE_EXPIRED`, `UNPAID_RIDE` |
| 422 | Business rule | `OUT_OF_SERVICE_AREA`, `PROMO_INVALID`, `PROMO_EXPIRED`, `OTP_INVALID`, `NO_ROUTE` |
| 429 | Rate limit | `RATE_LIMITED` |
| 500 | Unexpected | `INTERNAL` (generic message, logged with request id) |

Auth legend: **P** public · **U** any signed-in user · **R** rider · **D** driver (approved) · **D\*** driver (any status) · **A** admin · **W** webhook (signature) · **I** internal (secret header `x-internal-secret`).

## 2. Endpoints

### 2.1 Auth / Onboarding / Profile
| Method & path | Auth | Request | Response / notes |
|---|---|---|---|
| `POST /api/onboarding/role` | U (no role yet) | `{ role: "rider"\|"driver" }` | Sets Clerk `publicMetadata.role`, creates `driver_profiles` row if driver. `409` if role already set. Never accepts `admin` |
| `GET /api/me` | U | — | `{ profile, driverProfile? , activeRideId? , unreadNotifications }` |
| `PATCH /api/me` | U | `{ fullName?, phone?, avatarUrl?, emailNotifications? }` | Updated profile. Phone validated E.164 |
| `POST /api/me/avatar-upload-url` | U | `{ contentType, size }` | Signed upload URL for `avatars` bucket |
| `GET /api/me/emergency-contacts` | R | — | list |
| `POST /api/me/emergency-contacts` | R | `{ name, phone, email? }` | `422` if already 5 |
| `PATCH/DELETE /api/me/emergency-contacts/:id` | R | partial / — | owner only |
| `POST /api/webhooks/clerk` | W | Clerk (Svix) event | `user.created/updated/deleted` → upsert/anonymise `profiles`; idempotent |

### 2.2 Driver profile & availability
| Method & path | Auth | Request | Response / notes |
|---|---|---|---|
| `PUT /api/driver/application` | D* | `{ rideTypeCode, vehicle:{make,model,year,color,plate}, license:{number,expiry}, licenseDocPath? }` | Saves; status → `pending` (resubmit after reject). Validates plate uniqueness |
| `GET /api/driver/application` | D* | — | status, rejectionReason |
| `POST /api/driver/status` | D | `{ online: boolean, lat?, lng? }` | Toggle online. `409` if busy and going offline mid-ride |
| `PUT /api/driver/location` | D | `{ lat, lng, heading?, speed?, rideId? }` | Updates `current_location`; if `rideId` active also inserts history. Rate: 1 per 2 s |
| `GET /api/driver/offers` | D | — | Pending, unexpired offers (fallback to realtime) |
| `GET /api/driver/stats` | D | `?period=today\|week\|month` | `{ rides, grossPaise, netPaise, onlineMinutes, acceptanceRate, rating }` |
| `GET /api/driver/earnings` | D | `?period&page` | rows + totals + daily series |

### 2.3 Fare & booking
| Method & path | Auth | Request | Response / notes |
|---|---|---|---|
| `POST /api/fare/estimate` | R (rate 20/min) | `{ pickup:{lat,lng,address}, dropoff:{...}, stops?: [{lat,lng,address}] (≤3) }` | Calls Routes API. `{ quoteId, expiresAt, distanceM, durationS, polyline, surgeMultiplier, options:[{ rideTypeCode, name, capacity, etaToPickupMin|null, totalPaise, breakdown:{basePaise,distancePaise,timePaise,surgePaise,bookingFeePaise,discountPaise} }] }`. Errors `NO_ROUTE`, `OUT_OF_SERVICE_AREA` |
| `POST /api/promo/validate` | R (10/min) | `{ code, quoteId, rideTypeCode }` | `{ valid, discountPaise, newTotalPaise, message }` or `PROMO_INVALID/EXPIRED` |
| `POST /api/rides` | R (5/min) | `{ quoteId, rideTypeCode, paymentMethod:"card"\|"cash", paymentMethodId?, promoCode? }` | Recomputes price from quote; blocks if active ride or unpaid ride; creates ride (`requested`), OTP, `ride_stops`, triggers matching. `201 { ride }` |
| `GET /api/rides` | U | `?page&pageSize&status&from&to` | Own rides (rider: as rider; driver: as driver). Paginated |
| `GET /api/rides/active` | U | — | active ride or `null` |
| `GET /api/rides/:id` | U (participant/A) | — | Full ride with driver public info (rider view), rider public info (driver view), events, payment, rating. **OTP only included for the rider** |
| `POST /api/rides/:id/cancel` | R or D | `{ reason? }` | Applies fee rules; rider cancel after accept → fee; driver cancel → re-match. Returns `{ ride, cancellationFeePaise }` |

### 2.4 Ride lifecycle (driver)
| Method & path | Auth | Request | Response / notes |
|---|---|---|---|
| `POST /api/rides/:id/accept` | D | — | Calls `accept_ride` RPC. `409 RIDE_UNAVAILABLE` if taken/expired |
| `POST /api/rides/:id/decline` | D | — | Marks own offer `declined`, may trigger next match round |
| `POST /api/rides/:id/arrived` | D (assigned) | — | `accepted → arrived`; notify rider |
| `POST /api/rides/:id/start` | D (assigned) | `{ otp }` | Verifies OTP (`422 OTP_INVALID`, max 5 attempts → `429`/flag). `arrived → in_progress` |
| `POST /api/rides/:id/stops/:seq/reached` | D | — | Marks stop reached |
| `POST /api/rides/:id/complete` | D (assigned) | `{ actualDistanceM?, actualDurationS? }` | `in_progress → completed`; finalises fare; creates `payments` row (`pending` for card; for cash waits for confirm); frees driver; notifies rider |
| `POST /api/rides/:id/cash-received` | D (assigned) | — | Cash payments only: payment `succeeded`, earning created, receipt number, email |
| `GET /api/rides/:id/eta` | U (participant) | — | `{ etaSeconds, distanceM }` via Routes API (cached 15 s) |

### 2.5 Payments
| Method & path | Auth | Request | Response / notes |
|---|---|---|---|
| `POST /api/payments/setup-intent` | R | — | Creates Stripe customer if needed; `{ clientSecret }` for Payment Element (save card) |
| `GET /api/payments/methods` | R | — | Saved cards (synced from Stripe) |
| `PATCH /api/payments/methods/:id/default` | R | — | Set default |
| `DELETE /api/payments/methods/:id` | R | — | Detach from Stripe + delete row |
| `POST /api/rides/:id/pay` | R (owner) | `{ paymentMethodId? }` | Creates/reuses PaymentIntent (idempotency key `ride:{id}:pay`), returns `{ clientSecret, status, amountPaise }`. `409` if already paid |
| `GET /api/rides/:id/payment` | participant/A | — | payment status |
| `POST /api/admin/rides/:id/refund` | A | `{ amountPaise?, reason }` | Stripe refund; updates payment; notifies rider |
| `POST /api/webhooks/stripe` | W | raw body | Handles `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `setup_intent.succeeded`, `payment_method.detached`. Verify signature, dedupe via `stripe_events`, respond 200 |

### 2.6 Receipts
| Method & path | Auth | Notes |
|---|---|---|
| `GET /api/rides/:id/receipt` | R/D participant/A | Streams **PDF** (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename="receipt-<number>.pdf"`). Only when payment `succeeded` (else `409`) |
| `POST /api/rides/:id/receipt/email` | R (owner, 3/hour) | Sends receipt email with PDF attached (Resend) |

### 2.7 Ratings
| Method & path | Auth | Request | Notes |
|---|---|---|---|
| `POST /api/rides/:id/rating` | R or D participant | `{ stars:1-5, tags?:string[], comment?:string≤500 }` | Ride must be `completed` (& paid for rider); one per rater; `409` if exists (use PATCH) |
| `PATCH /api/rides/:id/rating` | owner | same | Allowed within 24 h |
| `GET /api/drivers/:id/reviews` | U | `?page` | Public reviews (rider names abbreviated e.g. "Asha K.") + avg |

### 2.8 Safety (SOS)
| Method & path | Auth | Request | Response / notes |
|---|---|---|---|
| `POST /api/rides/:id/sos` | R (rate 3/min) | `{ lat?, lng? }` | Creates `sos_events` + token; emails contacts with `/sos/{token}` link; notifies admins; `{ sosId, contactsNotified }`. `422` if no contacts (still alerts admin) |
| `POST /api/sos/:id/resolve` | R owner or A | `{ notes? }` | Resolve |
| `GET /api/sos/public/:token` | P (rate 30/min) | — | Minimal read-only: rider first name, route polyline, driver last location, vehicle/plate, status, expiry. `404/410` if expired |
| `GET /api/admin/sos` | A | `?status` | list |

### 2.9 Support
| Method & path | Auth | Request | Notes |
|---|---|---|---|
| `GET /api/support/tickets` | U | `?status&page` | own tickets |
| `POST /api/support/tickets` | U (10/min) | `{ category, subject, description, rideId?, attachments?:string[] }` | creates ticket + first message; notifies admins |
| `GET /api/support/tickets/:id` | owner/A | — | ticket + messages |
| `POST /api/support/tickets/:id/messages` | owner/A | `{ body, attachments? }` | notify other party (+email) |
| `POST /api/support/upload-url` | U | `{ contentType, size }` | signed URL (≤3 files, 5 MB) |
| `PATCH /api/admin/support/tickets/:id` | A | `{ status?, assignedAdminId? }` | |

### 2.10 Notifications
| Method & path | Auth | Notes |
|---|---|---|
| `GET /api/notifications` | U | `?unread=true&page` |
| `POST /api/notifications/read` | U | `{ ids?: string[] }` (omit = all) |

### 2.11 Admin
| Method & path | Notes |
|---|---|
| `GET /api/admin/overview` | KPIs + series (rides/day, revenue/day, onlineDrivers, activeRides, openTickets, activeSOS) |
| `GET /api/admin/users` `?q&role&page` · `PATCH /api/admin/users/:id` `{ isSuspended }` | Suspend also revokes Clerk sessions |
| `GET /api/admin/drivers` `?status` · `GET /api/admin/drivers/:id` · `POST /api/admin/drivers/:id/approve` · `POST /api/admin/drivers/:id/reject {reason}` · `POST /api/admin/drivers/:id/suspend` | Approve sets `approved_at`, notifies + emails |
| `GET /api/admin/rides` `?status&q&from&to&page` · `GET /api/admin/rides/:id` | |
| `GET/POST /api/admin/promos` · `PATCH/DELETE /api/admin/promos/:id` | code uppercase unique |
| `GET/PUT /api/admin/settings` | `app_settings` keys (validated by key-specific Zod schemas) · `PUT /api/admin/ride-types/:code` |
| `POST /api/admin/earnings/:id/mark-paid` | manual payout marker |

### 2.12 Internal / Utility
| Method & path | Auth | Notes |
|---|---|---|
| `POST /api/internal/matching/tick` | I | Called by DB cron (pg_net) every minute: expire offers, next match round, expire rides |
| `GET /api/health` | P | `{ status:"ok", time }` (no secrets) |
| `GET /api/dev/*` | disabled in production | dev utilities (seed, simulate driver) — guarded by `NODE_ENV !== 'production'` |

## 3. Realtime Contracts (Supabase)
| Channel / subscription | Payload | Who |
|---|---|---|
| `postgres_changes` `rides` `id=eq.{rideId}` | row (status, driver_id, timestamps) | rider, driver |
| `postgres_changes` `ride_offers` `driver_id=eq.{me}` INSERT/UPDATE | offer row; client then fetches ride preview via `GET /api/rides/:id/offer-preview` (limited fields) | driver |
| `postgres_changes` `notifications` `user_id=eq.{me}` INSERT | notification | all |
| Broadcast `ride:{rideId}:loc`, event `driver_location` | `{ lat, lng, heading, speed, ts }` | publisher: assigned driver; subscribers: rider |
| `postgres_changes` `sos_events` INSERT | row | admin |

## 4. Zod Schema Locations
All request/response schemas in `src/lib/validation/*.ts`, exported as `XxxInput` / `XxxOutput` types and reused by forms and handlers.

## 5. Example Payloads
**POST /api/fare/estimate → 200**
```json
{ "ok": true, "data": {
  "quoteId": "a1b2…", "expiresAt": "2026-03-12T12:35:00Z",
  "distanceM": 12400, "durationS": 1860, "polyline": "encoded…", "surgeMultiplier": 1.2,
  "options": [
    { "rideTypeCode": "mini", "name": "Mini", "capacity": 4, "etaToPickupMin": 4,
      "totalPaise": 32500,
      "breakdown": { "basePaise": 4000, "distancePaise": 14880, "timePaise": 4650, "surgePaise": 4706, "bookingFeePaise": 500, "discountPaise": 0 } }
  ] } }
```
**POST /api/rides/:id/start → 422**
```json
{ "ok": false, "error": { "code": "OTP_INVALID", "message": "That code doesn't match. Ask the rider to check their app.", "details": { "attemptsLeft": 3 } } }
```

## 6. OpenAPI
The agent should generate `docs/openapi.yaml` from the Zod schemas (e.g., `zod-to-openapi`) once endpoints are implemented, and keep it updated.
