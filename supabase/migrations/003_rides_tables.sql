-- 003_rides_tables.sql
create table if not exists fare_quotes (
  id uuid primary key default gen_random_uuid(),
  rider_id text not null references profiles(id),
  pickup_lat double precision,
  pickup_lng double precision,
  pickup_address text,
  dropoff_lat double precision,
  dropoff_lng double precision,
  dropoff_address text,
  stops jsonb not null default '[]',
  distance_m int not null,
  duration_s int not null,
  polyline text not null,
  surge_multiplier numeric(3,2) not null default 1.00,
  options jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists rides (
  id uuid primary key default gen_random_uuid(),
  rider_id text not null references profiles(id),
  driver_id text references profiles(id),
  ride_type_code text not null references ride_types(code),
  status ride_status not null default 'requested',
  pickup_address text not null,
  pickup_location geography(Point,4326) not null,
  dropoff_address text not null,
  dropoff_location geography(Point,4326) not null,
  route_polyline text not null,
  quoted_distance_m int not null,
  quoted_duration_s int not null,
  actual_distance_m int,
  actual_duration_s int,
  surge_multiplier numeric(3,2) not null default 1.00,
  base_fare_paise int not null,
  distance_fare_paise int not null,
  time_fare_paise int not null,
  surge_amount_paise int not null default 0,
  booking_fee_paise int not null default 0,
  discount_paise int not null default 0,
  promo_code_id uuid,
  total_fare_paise int not null,
  cancellation_fee_paise int not null default 0,
  payment_method payment_method_type not null,
  otp_code char(4) not null,
  otp_attempts int not null default 0,
  cancelled_by user_role,
  cancel_reason text,
  requested_at timestamptz default now(),
  accepted_at timestamptz,
  arrived_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  match_round int not null default 0,
  excluded_driver_ids text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists rides_rider_idx on rides (rider_id, created_at desc);
create index if not exists rides_driver_idx on rides (driver_id, created_at desc);
create index if not exists rides_status_idx on rides (status);

create table if not exists ride_stops (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id) on delete cascade,
  seq int not null,
  address text not null,
  location geography(Point,4326) not null,
  reached_at timestamptz,
  unique (ride_id, seq)
);

create table if not exists ride_offers (
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

create index if not exists offers_driver_idx on ride_offers (driver_id, status);

create table if not exists ride_events (
  id bigserial primary key,
  ride_id uuid not null references rides(id) on delete cascade,
  actor_id text,
  actor_role user_role,
  from_status ride_status,
  to_status ride_status not null,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists driver_location_history (
  id bigserial primary key,
  driver_id text not null references profiles(id) on delete cascade,
  ride_id uuid references rides(id) on delete set null,
  location geography(Point,4326) not null,
  heading numeric,
  speed numeric,
  recorded_at timestamptz default now()
);

create index if not exists dlh_ride_idx on driver_location_history (ride_id, recorded_at);

