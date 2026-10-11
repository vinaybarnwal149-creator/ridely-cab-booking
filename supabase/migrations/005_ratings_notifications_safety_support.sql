-- 005_ratings_notifications_safety_support.sql
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id) on delete cascade,
  rater_id text not null references profiles(id),
  ratee_id text not null references profiles(id),
  rater_role user_role not null,
  stars int not null check (stars between 1 and 5),
  tags text[] default '{}',
  comment text check (char_length(comment) <= 500),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (ride_id, rater_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb default '{}',
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists notif_user_idx on notifications (user_id, read_at, created_at desc);

create table if not exists sos_events (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id),
  rider_id text not null references profiles(id),
  status sos_status not null default 'active',
  public_token text not null unique,
  token_expires_at timestamptz not null,
  location geography(Point,4326),
  contacts_notified jsonb default '[]',
  admin_notes text,
  resolved_by text references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id),
  ride_id uuid references rides(id),
  category ticket_category not null,
  subject text not null,
  status ticket_status not null default 'open',
  assigned_admin_id text references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id text not null references profiles(id),
  is_admin boolean not null default false,
  body text not null,
  attachments text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now(),
  updated_by text
);

