-- 004_payments_promos.sql
create table if not exists payments (
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
  receipt_number text unique,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz default now(),
  payload jsonb
);

create table if not exists driver_earnings (
  id uuid primary key default gen_random_uuid(),
  driver_id text not null references profiles(id),
  ride_id uuid not null unique references rides(id),
  gross_paise int not null,
  commission_paise int not null,
  net_paise int not null,
  commission_percent numeric(5,2) not null,
  status earning_status not null default 'pending',
  paid_out_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  type promo_type not null,
  value int not null,
  max_discount_paise int,
  min_fare_paise int not null default 0,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  global_limit int,
  per_user_limit int not null default 1,
  first_ride_only boolean not null default false,
  ride_type_codes text[],
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references promo_codes(id),
  user_id text not null references profiles(id),
  ride_id uuid not null unique references rides(id),
  discount_paise int not null,
  created_at timestamptz default now()
);

