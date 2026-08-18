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
  status text not null default 'lead' check (status in ('active', 'past', 'lead')),
  notes text,
  created_at timestamptz not null default now()
);

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

do $$
declare
  t text;
begin
  foreach t in array array['clients', 'invoices', 'services', 'notes', 'calendar_events']
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
