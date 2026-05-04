-- =====================================================================
-- 04_orders.sql — Orders, Order Items, Service Requests
-- Run once in Supabase SQL Editor
-- Safe to re-run (IF NOT EXISTS / OR REPLACE)
-- =====================================================================

-- ── Order status enum ─────────────────────────────────────────────────
do $$ begin
  create type order_status as enum ('pending','preparing','ready','delivered','paid','cancelled');
exception when duplicate_object then null; end $$;

-- ── Service request type enum ─────────────────────────────────────────
do $$ begin
  create type service_type as enum ('callWaiter','requestWater','requestBill','needHelp');
exception when duplicate_object then null; end $$;

-- ── Orders ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  table_id      text not null,
  guest_id      uuid references public.guests(id) on delete set null,
  status        order_status not null default 'pending',
  total         numeric not null default 0,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists orders_restaurant_idx on public.orders (restaurant_id, created_at desc);
create index if not exists orders_table_idx      on public.orders (table_id, status);

-- ── Order items ─────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references public.orders(id) on delete cascade,
  menu_item_id  text not null,
  name          text not null,
  price         numeric not null,
  quantity      integer not null default 1,
  extras        jsonb not null default '[]',
  notes         text,
  created_at    timestamptz default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ── Service requests ───────────────────────────────────────────────────
create table if not exists public.service_requests (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  table_id      text not null,
  type          service_type not null,
  status        text not null default 'open',   -- open | acknowledged | done
  created_at    timestamptz default now()
);

create index if not exists service_requests_open_idx
  on public.service_requests (restaurant_id, status, created_at desc)
  where status = 'open';

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.service_requests enable row level security;

-- Orders: anon can insert + read own table, service key does the rest
drop policy if exists "anon insert orders"      on public.orders;
create policy "anon insert orders" on public.orders
  for insert with check (true);

drop policy if exists "anon read orders"        on public.orders;
create policy "anon read orders" on public.orders
  for select using (true);

drop policy if exists "anon update orders"      on public.orders;
create policy "anon update orders" on public.orders
  for update using (true) with check (true);

-- Order items: anon insert + read
drop policy if exists "anon insert order_items" on public.order_items;
create policy "anon insert order_items" on public.order_items
  for insert with check (true);

drop policy if exists "anon read order_items"   on public.order_items;
create policy "anon read order_items" on public.order_items
  for select using (true);

-- Service requests: anon insert + read
drop policy if exists "anon insert service_requests" on public.service_requests;
create policy "anon insert service_requests" on public.service_requests
  for insert with check (true);

drop policy if exists "anon read service_requests"   on public.service_requests;
create policy "anon read service_requests" on public.service_requests
  for select using (true);

drop policy if exists "anon update service_requests" on public.service_requests;
create policy "anon update service_requests" on public.service_requests
  for update using (true) with check (true);

-- ── Realtime ──────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'service_requests'
  ) then
    alter publication supabase_realtime add table public.service_requests;
  end if;
end $$;
