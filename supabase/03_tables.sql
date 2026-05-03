-- =====================================================================
-- Tischly v0.5 — Restaurant Tables
-- Run AFTER 01_tischly_full.sql
-- =====================================================================

drop table if exists public.restaurant_tables cascade;

create table public.restaurant_tables (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  number        integer not null,
  seats         integer not null default 4,
  status        text not null default 'free',
  created_at    timestamptz default now(),
  unique (restaurant_id, number)
);

create index if not exists restaurant_tables_rid_idx
  on public.restaurant_tables (restaurant_id, number);

alter table public.restaurant_tables enable row level security;

drop policy if exists "anon read tables" on public.restaurant_tables;
create policy "anon read tables" on public.restaurant_tables
  for select using (true);

drop policy if exists "service role manage tables" on public.restaurant_tables;
create policy "service role manage tables" on public.restaurant_tables
  for all using (true) with check (true);

-- Seed 12 demo tables
do $$
declare
  v_rid uuid;
begin
  select id into v_rid from public.restaurants where slug = 'tischly-demo';
  if v_rid is null then return; end if;

  insert into public.restaurant_tables (restaurant_id, number, seats, status) values
    (v_rid,  1, 4, 'occupied'),
    (v_rid,  2, 2, 'occupied'),
    (v_rid,  3, 6, 'occupied'),
    (v_rid,  4, 4, 'reserved'),
    (v_rid,  5, 4, 'free'),
    (v_rid,  6, 2, 'free'),
    (v_rid,  7, 4, 'free'),
    (v_rid,  8, 6, 'free'),
    (v_rid,  9, 4, 'free'),
    (v_rid, 10, 2, 'free'),
    (v_rid, 11, 4, 'free'),
    (v_rid, 12, 8, 'free')
  on conflict (restaurant_id, number) do nothing;
end $$;
