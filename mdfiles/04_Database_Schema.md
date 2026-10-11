# 04 — Database Schema (Supabase Postgres + PostGIS)

Rules: all schema changes are **numbered SQL migrations** in `supabase/migrations/`. IDs: user ids are **Clerk user ids (text)**; all other ids are `uuid default gen_random_uuid()`. Money = **integer paise**. Timestamps = `timestamptz default now()`. Every table has RLS enabled. The SQL below is the reference design; the agent may refine types/indexes but must keep names, relationships, and semantics.

## 1. Extensions
```sql
create extension if not exists postgis;
create extension if not exists pg_cron;      -- enable in Supabase dashboard if needed
create extension if not exists pg_net;
create extension if not exists pgcrypto;
```

## 2. Enums
```sql
create type user_role as enum ('rider','driver','admin');
create type driver_status as enum ('pending','approved','rejected','suspended');
create type ride_status as enum ('requested','accepted','arrived','in_progress','completed','cancelled','expired');
create type payment_method_type as enum ('card','cash');
create type payment_status as enum ('pending','processing','succeeded','failed','refunded','partially_refunded');
create type offer_status as enum ('pending','accepted','declined','expired','cancelled');
create type earning_status as enum ('pending','paid');
create type ticket_status as enum ('open','in_progress','resolved','closed');
create type ticket_category as enum ('payment','lost_item','driver_behaviour','ride_issue','app_bug','other');
create type sos_status as enum ('active','resolved');
create type promo_type as enum ('percent','flat');
```

## 3. Tables

### 3.1 Identity
```sql
create table profiles (
  id text primary key,                         -- Clerk user id
  role user_role not null default 'rider',
  full_name text not null,
  email text not null unique,
  phone text,                                  -- E.164
  avatar_url text,
  stripe_customer_id text unique,
  is_suspended boolean not null default false,
  email_notifications boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table ride_types (
  code text primary key,                       -- bike, auto, mini, sedan, xl
  name text not null,
  capacity int not null,
  base_fare_paise int not null,
  per_km_paise int not null,
  per_min_paise int not null,
  min_fare_paise int not null,
  icon text,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table driver_profiles (
  user_id text primary key references profiles(id) on delete cascade,
  status driver_status not null default 'pending',
  rejection_reason text,
  ride_type_code text references ride_types(code),
  vehicle_make text, vehicle_model text, vehicle_year int, vehicle_color text,
  vehicle_plate text unique,
  license_number text, license_expiry date, license_doc_path text,
  is_online boolean not null default false,
  is_busy boolean not null default false,
  current_location geography(Point,4326),
  heading numeric,
  location_updated_at timestamptz,
  avg_rating numeric(3,2) not null default 0,
  rating_count int not null default 0,
  total_rides int not null default 0,
  acceptance_rate numeric(5,2) default 100,
  approved_at timestamptz, approved_by text references profiles(id),
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index driver_loc_gix on driver_profiles using gist (current_location);
create index driver_online_idx on driver_profiles (is_online, is_busy, status);

create table emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  name text not null, phone text not null, email text,
  created_at timestamptz default now()
);   -- app enforces max 5 per user (trigger)

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  stripe_payment_method_id text not null unique,
  brand text, last4 text, exp_month int, exp_year int,
  is_default boolean not null default false,
  created_at timestamptz default now()
);
```

### 3.2 Rides
```sql
create table fare_quotes (                      -- signed, short-lived estimates
  id uuid primary key default gen_random_uuid(),
  rider_id text not null references profiles(id),
  pickup_lat double precision, pickup_lng double precision, pickup_address text,
  dropoff_lat double precision, dropoff_lng double precision, dropoff_address text,
  stops jsonb not null default '[]',            -- [{lat,lng,address}]
  distance_m int not null, duration_s int not null,
  polyline text not null,
  surge_multiplier numeric(3,2) not null default 1.00,
  options jsonb not null,                       -- per ride type: {code, totalPaise, breakdown{...}}
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table rides (
  id uuid primary key default gen_random_uuid(),
  rider_id text not null references profiles(id),
  driver_id text references profiles(id),
  ride_type_code text not null references ride_types(code),
  status ride_status not null default 'requested',
  pickup_address text not null, pickup_location geography(Point,4326) not null,
  dropoff_address text not null, dropoff_location geography(Point,4326) not null,
  route_polyline text not null,
  quoted_distance_m int not null, quoted_duration_s int not null,
  actual_distance_m int, actual_duration_s int,
  surge_multiplier numeric(3,2) not null default 1.00,
  base_fare_paise int not null, distance_fare_paise int not null, time_fare_paise int not null,
  surge_amount_paise int not null default 0,
  booking_fee_paise int not null default 0,
  discount_paise int not null default 0,
  promo_code_id uuid,
  total_fare_paise int not null,                 -- amount rider pays (incl. cancellation fee if any)
  cancellation_fee_paise int not null default 0,
  payment_method payment_method_type not null,
  otp_code char(4) not null,
  otp_attempts int not null default 0,
  cancelled_by user_role, cancel_reason text,
  requested_at timestamptz default now(),
  accepted_at timestamptz, arrived_at timestamptz, started_at timestamptz,
  completed_at timestamptz, cancelled_at timestamptz,
  match_round int not null default 0,
  excluded_driver_ids text[] not null default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index rides_rider_idx on rides (rider_id, created_at desc);
create index rides_driver_idx on rides (driver_id, created_at desc);
create index rides_status_idx on rides (status);
create unique index one_active_ride_per_rider on rides (rider_id)
  where status in ('requested','accepted','arrived','in_progress');
create unique index one_active_ride_per_driver on rides (driver_id)
  where driver_id is not null and status in ('accepted','arrived','in_progress');

create table ride_stops (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id) on delete cascade,
  seq int not null, address text not null, location geography(Point,4326) not null,
  reached_at timestamptz,
  unique (ride_id, seq)
);

create table ride_offers (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id) on delete cascade,
  driver_id text not null references profiles(id),
  status offer_status not null default 'pending',
  distance_to_pickup_m int,
  round int not null default 1,
  expires_at timestamptz not null,
  responded_at timestamptz,
  created_at timestamptz default now(),
  unique (ride_id, driver_id, round)
);
create index offers_driver_idx on ride_offers (driver_id, status);

create table ride_events (                       -- audit trail / timeline
  id bigserial primary key,
  ride_id uuid not null references rides(id) on delete cascade,
  actor_id text, actor_role user_role,
  from_status ride_status, to_status ride_status not null,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create table driver_location_history (           -- retained 30 days (pg_cron cleanup)
  id bigserial primary key,
  driver_id text not null references profiles(id) on delete cascade,
  ride_id uuid references rides(id) on delete set null,
  location geography(Point,4326) not null,
  heading numeric, speed numeric,
  recorded_at timestamptz default now()
);
create index dlh_ride_idx on driver_location_history (ride_id, recorded_at);
```

### 3.3 Payments & earnings
```sql
create table payments (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id),
  rider_id text not null references profiles(id),
  method payment_method_type not null,
  amount_paise int not null,
  currency char(3) not null default 'INR',
  status payment_status not null default 'pending',
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  failure_reason text,
  refunded_paise int not null default 0,
  receipt_number text unique,                    -- RCP-YYYYMMDD-XXXXX (set on success)
  paid_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create unique index payments_one_success_per_ride on payments (ride_id) where status = 'succeeded';

create table stripe_events (                      -- webhook idempotency
  id text primary key,                            -- Stripe event id
  type text not null, processed_at timestamptz default now(), payload jsonb
);

create table driver_earnings (
  id uuid primary key default gen_random_uuid(),
  driver_id text not null references profiles(id),
  ride_id uuid not null unique references rides(id),
  gross_paise int not null, commission_paise int not null, net_paise int not null,
  commission_percent numeric(5,2) not null,
  status earning_status not null default 'pending',
  paid_out_at timestamptz,
  created_at timestamptz default now()
);
```

### 3.4 Promotions
```sql
create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                      -- stored UPPERCASE
  description text,
  type promo_type not null,
  value int not null,                             -- percent (1-100) or flat paise
  max_discount_paise int,
  min_fare_paise int not null default 0,
  valid_from timestamptz not null default now(), valid_to timestamptz,
  global_limit int, per_user_limit int not null default 1,
  first_ride_only boolean not null default false,
  ride_type_codes text[],                         -- null = all
  is_active boolean not null default true,
  created_at timestamptz default now()
);
create table promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references promo_codes(id),
  user_id text not null references profiles(id),
  ride_id uuid not null unique references rides(id),
  discount_paise int not null,
  created_at timestamptz default now()
);
alter table rides add constraint rides_promo_fk foreign key (promo_code_id) references promo_codes(id);
```

### 3.5 Ratings, notifications, safety, support, settings
```sql
create table ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id) on delete cascade,
  rater_id text not null references profiles(id),
  ratee_id text not null references profiles(id),
  rater_role user_role not null,
  stars int not null check (stars between 1 and 5),
  tags text[] default '{}', comment text check (char_length(comment) <= 500),
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (ride_id, rater_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  type text not null,                             -- ride_accepted, driver_arrived, ...
  title text not null, body text,
  data jsonb default '{}',                        -- { rideId, ticketId, ... }
  read_at timestamptz,
  created_at timestamptz default now()
);
create index notif_user_idx on notifications (user_id, read_at, created_at desc);

create table sos_events (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id),
  rider_id text not null references profiles(id),
  status sos_status not null default 'active',
  public_token text not null unique,              -- 32+ random bytes, base64url
  token_expires_at timestamptz not null,
  location geography(Point,4326),
  contacts_notified jsonb default '[]',
  admin_notes text,
  resolved_by text references profiles(id), resolved_at timestamptz,
  created_at timestamptz default now()
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id),
  ride_id uuid references rides(id),
  category ticket_category not null,
  subject text not null, status ticket_status not null default 'open',
  assigned_admin_id text references profiles(id),
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id text not null references profiles(id),
  is_admin boolean not null default false,
  body text not null, attachments text[] default '{}',
  created_at timestamptz default now()
);

create table app_settings (                       -- single-row-per-key config, admin editable
  key text primary key, value jsonb not null, updated_at timestamptz default now(), updated_by text
);
-- seeds: surge {enabled:true,tiers:[{ratio:1,mult:1.2},{ratio:2,mult:1.5},{ratio:3,mult:2.0}],cap:2.0},
-- commission_percent 20, cancellation_fee_paise 3000, booking_fee_paise 500,
-- free_cancel_window_s 120, offer_ttl_s 30, match_radius_m [5000,8000], max_match_rounds 3, quote_ttl_s 300
```

## 4. Functions, Triggers, RPCs
| Name | Purpose |
|---|---|
| `set_updated_at()` trigger | Keep `updated_at` fresh on all tables having it |
| `find_nearby_drivers(p geography, ride_type text, radius_m int, exclude text[], lim int)` | `ST_DWithin` + filters (online, approved, not busy, location < 60 s old) ordered by `ST_Distance` |
| `accept_ride(ride_id uuid, driver_id text)` | Atomic acceptance (see doc 03 §6), returns the ride row or raises `RIDE_UNAVAILABLE` |
| `update_driver_rating()` trigger on `ratings` | Recompute `avg_rating`, `rating_count` for ratee if driver |
| `enforce_emergency_contact_limit()` trigger | Max 5 contacts per user |
| `surge_for(p geography)` | Return multiplier using open rides vs online drivers within 5 km and `app_settings.surge` |
| `expire_stale_offers_and_rides()` | Called by pg_cron every minute (see doc 03 §6) |
| `purge_old_location_history()` | Daily; deletes `driver_location_history` older than 30 days |
| `expire_sos_tokens()` | Optional; tokens are also checked on read |
| `generate_receipt_number()` | `RCP-YYYYMMDD-` + 5-digit sequence |

## 5. Row Level Security (summary — implement as SQL policies)
`auth.jwt()->>'sub'` = Clerk user id. Admin = JWT metadata role `admin` (helper SQL function `is_admin()`).

| Table | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| profiles | self; admin; riders may read **limited** driver info for their active ride via a view `ride_driver_public` (name, avatar, rating, vehicle) | self update limited fields (name, phone, avatar, prefs); admin all; inserts by webhook (service role) |
| driver_profiles | self; admin; public view for assigned rider | self (own onboarding fields only, never `status`, rating fields); admin |
| rides | rider = self; driver = self (assigned); driver with a pending offer (limited via view); admin | **service role only** |
| ride_offers | driver = self; admin | service role only |
| ride_events, ride_stops | participants + admin | service role only |
| payments, driver_earnings | owner + admin | service role only |
| payment_methods | owner | service role only |
| ratings | participants + admin; driver average via profile | rider insert for own completed ride (through API) |
| notifications | owner | owner may update `read_at`; inserts service role |
| emergency_contacts | owner | owner (CRUD) |
| sos_events | owner + admin | service role only; public SOS page reads via server route using token (not direct DB) |
| support_tickets / ticket_messages | owner + admin | owner create/reply; admin reply/update |
| promo_codes, ride_types, app_settings | ride_types/active promo basics readable by authenticated; settings admin only | admin only |
| fare_quotes, stripe_events, driver_location_history | service role only (admin read) | service role only |

**Write RLS tests:** a script asserts rider B cannot select rider A's rides/payments/notifications; driver cannot see rides not assigned/offered; non-admin cannot read `app_settings` writes.

## 6. Storage Buckets
| Bucket | Public | Limits | Path pattern |
|---|---|---|---|
| `avatars` | public read | 2 MB, image/* | `{userId}/{uuid}.webp` |
| `driver-docs` | private (signed URL) | 5 MB, image/*, pdf | `{userId}/licence-{uuid}` |
| `ticket-files` | private | 5 MB, image/* | `{ticketId}/{uuid}` |

## 7. Seed Data (`supabase/seed.sql`)
- 5 `ride_types` from PRD §4.3.
- `app_settings` defaults above.
- Promo codes `WELCOME50`, `FLAT30`.
- FAQ is static content in code (`content/faq.ts`), not DB.
- Dev only (`scripts/seed-dev-users.ts`): 1 admin, 2 riders, 3 approved drivers with locations around Mumbai (e.g., Bandra 19.0596,72.8295; Andheri 19.1136,72.8697; Powai 19.1176,72.9060), sample completed rides/ratings.

## 8. Migration Order
`001_extensions_enums` → `002_identity_tables` → `003_rides_tables` → `004_payments_promos` → `005_ratings_notifications_safety_support` → `006_functions_triggers` → `007_rls_policies` → `008_storage_buckets` → `009_cron_jobs` → `seed.sql`.
