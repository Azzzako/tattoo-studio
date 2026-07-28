-- 0001_init.sql
-- Base schema for the tattoo studio platform.
-- All business tables include studio_id to be tenant-ready.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create table if not exists studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'America/Mexico_City',
  locale text not null default 'es-MX',
  brand_color text,
  logo_url text,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  studio_id uuid not null references studios (id) on delete cascade,
  full_name text not null,
  display_name text not null,
  phone text,
  avatar_url text,
  locale text not null default 'es-MX',
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type membership_role as enum (
  'platform_superadmin',
  'studio_owner',
  'artist_admin',
  'staff_readonly'
);

create table if not exists studio_memberships (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role membership_role not null,
  invited_by uuid references auth.users (id),
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, user_id)
);
create index if not exists studio_memberships_user_idx on studio_memberships (user_id);
create index if not exists studio_memberships_studio_role_idx on studio_memberships (studio_id, role);

create table if not exists artist_profiles (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  slug text not null,
  display_name text not null,
  bio text,
  avatar_url text,
  styles text[] not null default '{}',
  experience_years integer,
  timezone text not null default 'America/Mexico_City',
  booking_buffer_minutes integer not null default 15 default 0, -- placeholder removed below
  is_active boolean not null default true,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, slug)
);
create index if not exists artist_profiles_studio_idx on artist_profiles (studio_id);

alter table artist_profiles
  alter column booking_buffer_minutes set default 15,
  alter column booking_buffer_minutes set not null;

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  network text not null check (network in ('instagram', 'tiktok', 'youtube', 'x', 'facebook', 'threads', 'website')),
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists social_links_artist_idx on social_links (artist_id);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_artist_idx on services (artist_id);

create type weekday as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  weekday weekday not null,
  starts_at time not null,
  ends_at time not null,
  effective_from date not null,
  effective_to date,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists availability_rules_artist_idx on availability_rules (artist_id);

create table if not exists availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  date date not null,
  starts_at time,
  ends_at time,
  kind text not null check (kind in ('block', 'extra')),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists availability_exceptions_artist_date_idx on availability_exceptions (artist_id, date);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  notes_internal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);
create index if not exists clients_studio_idx on clients (studio_id);

create type appointment_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  service_id uuid not null references services (id) on delete restrict,
  client_id uuid not null references clients (id) on delete restrict,
  status appointment_status not null default 'pending',
  range tstzrange not null,
  timezone text not null,
  description text,
  google_event_id text,
  google_etag text,
  client_token_hash text,
  client_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  exclude using gist (artist_id with =, range with &&) where (status in ('pending', 'confirmed'))
);
create index if not exists appointments_artist_range_idx on appointments using gist (artist_id, range);
create index if not exists appointments_studio_idx on appointments (studio_id);

create type hold_reason as enum ('booking_attempt', 'manual');

create table if not exists booking_holds (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  range tstzrange not null,
  reason hold_reason not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  exclude using gist (artist_id with =, range with &&) where (expires_at > now())
);
create index if not exists booking_holds_artist_range_idx on booking_holds using gist (artist_id, range);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  title text not null,
  description text,
  body_zone text,
  style text,
  is_featured boolean not null default false,
  is_public boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists portfolio_items_artist_idx on portfolio_items (artist_id);
create index if not exists portfolio_items_featured_idx on portfolio_items (is_featured, published_at desc);

create table if not exists portfolio_images (
  id uuid primary key default gen_random_uuid(),
  portfolio_item_id uuid not null references portfolio_items (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists portfolio_images_item_idx on portfolio_images (portfolio_item_id);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  location text,
  city text,
  country text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  external_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, slug)
);

create table if not exists event_artists (
  event_id uuid not null references events (id) on delete cascade,
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  primary key (event_id, artist_id)
);

create table if not exists google_connections (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  google_user_email text not null,
  google_calendar_id text not null,
  access_token_cipher text not null,
  refresh_token_cipher text not null,
  access_token_expires_at timestamptz not null,
  scope text not null,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, google_calendar_id)
);

create type calendar_event_source as enum ('app', 'google');

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  google_event_id text,
  source calendar_event_source not null,
  range tstzrange not null,
  title text not null,
  is_busy boolean not null default true,
  is_synced boolean not null default false,
  last_synced_at timestamptz,
  etag text,
  ical_uid text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  exclude using gist (artist_id with =, range with &&) where (is_busy = true)
);
create index if not exists calendar_events_artist_idx on calendar_events (artist_id);
create index if not exists calendar_events_google_idx on calendar_events (google_event_id);

create table if not exists sync_channels (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  channel_id text not null,
  resource_id text not null,
  resource_uri text not null,
  expires_at timestamptz not null,
  sync_token text,
  last_full_sync_at timestamptz,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sync_log (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references sync_channels (id) on delete set null,
  artist_id uuid not null references artist_profiles (id) on delete cascade,
  received_at timestamptz not null default now(),
  event_kind text not null,
  payload jsonb,
  error text
);

create type notification_kind as enum (
  'request_received',
  'request_confirmed',
  'request_rejected',
  'request_rescheduled',
  'request_cancelled',
  'appointment_reminder',
  'admin_alert'
);

create type notification_channel as enum ('email', 'whatsapp');

create type notification_status as enum ('queued', 'sending', 'sent', 'failed', 'skipped');

create table if not exists notification_outbox (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  artist_id uuid references artist_profiles (id) on delete cascade,
  client_id uuid references clients (id) on delete set null,
  appointment_id uuid references appointments (id) on delete cascade,
  kind notification_kind not null,
  channel notification_channel not null,
  status notification_status not null default 'queued',
  attempts integer not null default 0,
  scheduled_for timestamptz not null default now(),
  payload jsonb not null,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notification_outbox_status_idx on notification_outbox (status, scheduled_for);
create index if not exists notification_outbox_studio_idx on notification_outbox (studio_id);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_role text,
  entity text not null,
  entity_id uuid,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_studio_created_idx on audit_logs (studio_id, created_at desc);