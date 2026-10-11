-- 002_identity_tables.sql
create table if not exists profiles (
  id text primary key,
  role user_role not null default 'rider',
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  stripe_customer_id text unique,
  is_suspended boolean not null default false,
  email_notifications boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists ride_types (
  code text primary key,
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

create table if not exists driver_profiles (
  user_id text primary key references profiles(id) on delete cascade,
  status driver_status not null default 'pending',
  rejection_reason text,
  ride_type_code text references ride_types(code),
  vehicle_make text,
  vehicle_model text,
  vehicle_year int,
  vehicle_color text,
  vehicle_plate text unique,
  license_number text,
  license_expiry date,
  license_doc_path text,
  is_online boolean not null default false,
  is_busy boolean not null default false,
  current_location geography(Point, 4326),
  heading numeric,
  location_updated_at timestamptz,
  avg_rating numeric(3,2) not null default 0,
  rating_count int not null default 0,
  total_rides int not null default 0,
  acceptance_rate numeric(5,2) default 100,
  approved_at timestamptz,
  approved_by text references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists driver_loc_gix on driver_profiles using gist (current_location);
create index if not exists driver_online_idx on driver_profiles (is_online, is_busy, status);

create table if not exists emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz default now()
);

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  stripe_payment_method_id text not null unique,
  brand text,
  last4 text,
  exp_month int,
  exp_year int,
  is_default boolean not null default false,
  created_at timestamptz default now()
);

