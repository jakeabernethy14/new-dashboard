-- Reel Ops schema
-- Paste this whole file into Supabase Dashboard > SQL Editor > New query > Run.
-- Safe to re-run: uses "if not exists" / "or replace" where possible.

create extension if not exists "pgcrypto";

-- ========== CLIENTS ==========
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  description text,
  created_at timestamptz not null default now()
);

-- If you ran an earlier version of this schema that had a "status" or "notes"
-- column, this brings an existing table up to date without losing data:
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'clients' and column_name = 'notes')
     and not exists (select 1 from information_schema.columns where table_name = 'clients' and column_name = 'description') then
    alter table clients rename column notes to description;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'clients' and column_name = 'status') then
    alter table clients drop column status;
  end if;
end $$;

-- ========== INVOICES ==========
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  invoice_number text not null,
  description text,
  amount numeric(10, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  issue_date date not null default current_date,
  due_date date not null,
  created_at timestamptz not null default now()
);

-- ========== OUTGOING SERVICES (subscriptions / tools you pay for) ==========
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  category text,
  cost numeric(10, 2) not null default 0,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'one-time')),
  next_billing_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  url text,
  notes text,
  created_at timestamptz not null default now()
);

-- ========== NOTES ==========
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- ========== CALENDAR EVENTS ==========
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  event_type text not null default 'other' check (event_type in ('shoot', 'edit', 'deadline', 'meeting', 'other')),
  start_time timestamptz not null,
  end_time timestamptz,
  client_id uuid references clients(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ========== TEAM MEMBERS ==========
-- Simple app-level team list (not Supabase Auth accounts). See README for why.
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  invited_at timestamptz not null default now()
);

-- ========== APP SETTINGS ==========
-- One row per user, holding studio-wide preferences.
create table if not exists app_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  allow_registration boolean not null default true,
  theme_default text not null default 'dark' check (theme_default in ('dark', 'light')),
  updated_at timestamptz not null default now()
);

-- ========== INDEXES ==========
create index if not exists idx_invoices_client on invoices(client_id);
create index if not exists idx_events_start on calendar_events(start_time);
create index if not exists idx_events_client on calendar_events(client_id);

-- ========== ROW LEVEL SECURITY ==========
-- Every table is private per-user: you only ever see your own rows.
alter table clients enable row level security;
alter table invoices enable row level security;
alter table services enable row level security;
alter table notes enable row level security;
alter table calendar_events enable row level security;
alter table team_members enable row level security;
alter table app_settings enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['clients', 'invoices', 'services', 'notes', 'calendar_events', 'team_members', 'app_settings']
  loop
    execute format('drop policy if exists "select_own_%1$s" on %1$s', t);
    execute format('drop policy if exists "insert_own_%1$s" on %1$s', t);
    execute format('drop policy if exists "update_own_%1$s" on %1$s', t);
    execute format('drop policy if exists "delete_own_%1$s" on %1$s', t);

    execute format('create policy "select_own_%1$s" on %1$s for select using (auth.uid() = user_id)', t);
    execute format('create policy "insert_own_%1$s" on %1$s for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "update_own_%1$s" on %1$s for update using (auth.uid() = user_id)', t);
    execute format('create policy "delete_own_%1$s" on %1$s for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- The login page needs to check "allow_registration" before a visitor has
-- signed in at all, so app_settings gets one extra public-read policy on top
-- of the owner-only one above. This is fine for a single-studio app like this
-- one; if you ever support multiple separate studios sharing one project,
-- swap this for a dedicated public settings table instead.
drop policy if exists "public_read_app_settings" on app_settings;
create policy "public_read_app_settings" on app_settings for select using (true);
