-- =====================================================================
-- Tischly v0.2 + v0.3 — Full migration (run as one)
--
-- Adds:
--   • Restaurant whitelabel (logo, colors, idle video)
--   • Ad rotation system (idle screen + menu banners) with impression analytics
--   • Free charging sessions with QR onboarding
--   • Guest CRM (auth-linked, per-restaurant)
--   • Loyalty points (1 CHF = 1 point, 100 points = 1 CHF off)
--   • Birthday gifts + referrals
--   • AI recommendation cache (Claude Haiku)
--   • Realtime channel for guest sessions
--
-- Run AFTER your initial schema.sql (the one that created orders, menu, etc.)
-- Safe to re-run: every CREATE uses IF NOT EXISTS, every policy uses DROP+CREATE.
-- =====================================================================

-- =====================================================================
-- 1. RESTAURANT WHITELABEL
-- =====================================================================
create table if not exists public.restaurants (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  logo_url        text,
  primary_color   text default '#84CC16',                    -- lime-500
  accent_color    text default '#0F172A',                    -- slate-900
  idle_video_url  text,
  idle_headline   jsonb default '{"de":"Tischly","en":"Tischly","tr":"Tischly","fr":"Tischly","it":"Tischly","es":"Tischly"}'::jsonb,
  idle_subline    jsonb default '{"de":"Tippen zum Starten","en":"Tap to start","tr":"Başlamak için dokun","fr":"Touchez pour commencer","it":"Tocca per iniziare","es":"Toca para empezar"}'::jsonb,
  charging_enabled boolean default true,
  charging_minutes  integer default 30,
  created_at      timestamptz default now()
);

insert into public.restaurants (slug, name)
values ('tischly-demo', 'Tischly Demo Restaurant')
on conflict (slug) do nothing;

-- =====================================================================
-- 2. ADS (rotation slots)
-- =====================================================================
do $$ begin
  create type ad_kind as enum ('image', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ad_placement as enum ('idle', 'menu_banner', 'category_break');
exception when duplicate_object then null; end $$;

create table if not exists public.ads (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid references public.restaurants(id) on delete cascade,
  title           text not null,
  kind            ad_kind not null default 'image',
  media_url       text not null,
  click_url       text,
  placement       ad_placement not null default 'idle',
  duration_ms     integer not null default 7000,
  weight          integer not null default 1,
  active          boolean not null default true,
  starts_at       timestamptz default now(),
  ends_at         timestamptz,
  created_at      timestamptz default now()
);

create index if not exists ads_active_idx
  on public.ads (restaurant_id, placement, active);

create table if not exists public.ad_impressions (
  id            bigserial primary key,
  ad_id         uuid references public.ads(id) on delete cascade,
  table_id      text,
  shown_at      timestamptz default now(),
  duration_ms   integer
);

create index if not exists ad_impressions_ad_idx
  on public.ad_impressions (ad_id, shown_at desc);

-- Seed 3 demo ads (Pexels free, commercial-OK)
insert into public.ads (restaurant_id, title, kind, media_url, placement, duration_ms, weight)
select
  r.id, v.title, v.kind::ad_kind, v.media_url, v.placement::ad_placement, v.duration_ms, v.weight
from public.restaurants r,
(values
  ('Demo: Daily Special',  'image', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&w=1200', 'idle', 7000, 2),
  ('Demo: House Cocktail', 'image', 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&w=1200', 'idle', 7000, 1),
  ('Demo: Dessert',        'image', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&w=1200',  'idle', 7000, 1)
) as v(title, kind, media_url, placement, duration_ms, weight)
where r.slug = 'tischly-demo'
on conflict do nothing;

-- =====================================================================
-- 3. FREE CHARGING SESSIONS
-- =====================================================================
create table if not exists public.charge_sessions (
  id            uuid primary key default gen_random_uuid(),
  table_id      text not null,
  restaurant_id uuid references public.restaurants(id),
  guest_email   text,
  guest_name    text,
  consent       boolean default false,
  started_at    timestamptz default now(),
  ends_at       timestamptz,
  ended_at      timestamptz,
  source        text default 'qr'
);

create index if not exists charge_sessions_table_idx
  on public.charge_sessions (table_id, started_at desc);

-- =====================================================================
-- 4. LOYALTY CONFIG (per restaurant)
--   Defaults: 1 CHF = 1 point, 100 points = 1 CHF off
-- =====================================================================
create table if not exists public.loyalty_config (
  restaurant_id          uuid primary key references public.restaurants(id) on delete cascade,
  points_per_currency    numeric not null default 1.0,
  redeem_rate            numeric not null default 0.01,
  redeem_min_points      integer not null default 100,
  birthday_gift_value    numeric not null default 10,
  referral_reward_points integer not null default 100,
  ai_recommendations     boolean not null default true,
  updated_at             timestamptz default now()
);

insert into public.loyalty_config (restaurant_id)
select id from public.restaurants where slug = 'tischly-demo'
on conflict (restaurant_id) do nothing;

-- =====================================================================
-- 5. GUESTS (CRM)
-- =====================================================================
create table if not exists public.guests (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid references public.restaurants(id) on delete cascade,
  auth_user_id    uuid unique,
  email           text not null,
  name            text not null,
  birthday        date,
  points          integer not null default 0,
  lifetime_spent  numeric not null default 0,
  referral_code   text unique,
  referred_by     uuid references public.guests(id),
  last_visit_at   timestamptz,
  visit_count     integer not null default 0,
  created_at      timestamptz default now(),
  unique (restaurant_id, email)
);

create index if not exists guests_email_idx on public.guests (email);
create index if not exists guests_auth_idx  on public.guests (auth_user_id);

-- =====================================================================
-- 6. GUEST SESSIONS (active table login)
-- =====================================================================
do $$ begin
  create type session_role as enum ('host', 'companion');
exception when duplicate_object then null; end $$;

create table if not exists public.guest_sessions (
  id            uuid primary key default gen_random_uuid(),
  table_id      text not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  guest_id      uuid references public.guests(id) on delete cascade,
  role          session_role not null default 'host',
  join_token    text not null,
  started_at    timestamptz default now(),
  expires_at    timestamptz default (now() + interval '4 hours'),
  ended_at      timestamptz,
  unique (join_token)
);

create index if not exists guest_sessions_table_idx
  on public.guest_sessions (table_id, ended_at) where ended_at is null;

-- =====================================================================
-- 7. GUEST ORDERS (link orders to guests for analytics)
-- =====================================================================
create table if not exists public.guest_orders (
  id            bigserial primary key,
  guest_id      uuid references public.guests(id) on delete cascade,
  order_id      uuid not null,
  table_id      text,
  total_amount  numeric not null,
  points_earned integer not null default 0,
  points_used   integer not null default 0,
  created_at    timestamptz default now()
);

create index if not exists guest_orders_guest_idx
  on public.guest_orders (guest_id, created_at desc);

-- =====================================================================
-- 8. GUEST FAVORITES (auto-derived)
-- =====================================================================
create table if not exists public.guest_favorites (
  guest_id      uuid references public.guests(id) on delete cascade,
  item_id       text not null,
  order_count   integer not null default 1,
  last_ordered  timestamptz default now(),
  primary key (guest_id, item_id)
);

create index if not exists guest_favorites_top_idx
  on public.guest_favorites (guest_id, order_count desc);

-- =====================================================================
-- 9. REFERRALS
-- =====================================================================
do $$ begin
  create type referral_status as enum ('pending', 'rewarded', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid references public.guests(id) on delete cascade,
  referred_id   uuid references public.guests(id) on delete cascade,
  status        referral_status not null default 'pending',
  reward_points integer not null default 0,
  created_at    timestamptz default now(),
  rewarded_at   timestamptz,
  unique (referred_id)
);

-- =====================================================================
-- 10. AI SUGGESTIONS CACHE (Claude Haiku, 24h TTL)
-- =====================================================================
create table if not exists public.ai_suggestions_cache (
  guest_id      uuid primary key references public.guests(id) on delete cascade,
  suggestions   jsonb not null,
  generated_at  timestamptz default now(),
  expires_at    timestamptz default (now() + interval '24 hours')
);

-- =====================================================================
-- HELPERS
-- =====================================================================

-- Award points after a paid order; redeem points if requested.
-- Errors if guest has insufficient points for redemption.
create or replace function public.fn_award_points(
  p_guest_id    uuid,
  p_amount      numeric,
  p_order_id    uuid,
  p_table_id    text,
  p_points_used integer default 0
) returns table (new_balance integer, points_earned integer)
language plpgsql
as $$
declare
  v_cfg     loyalty_config%rowtype;
  v_guest   guests%rowtype;
  v_earned  integer;
begin
  select g.* into v_guest from guests g where g.id = p_guest_id for update;
  if not found then
    raise exception 'Guest not found';
  end if;

  select c.* into v_cfg from loyalty_config c where c.restaurant_id = v_guest.restaurant_id;
  if not found then
    v_cfg.points_per_currency := 1;
  end if;

  v_earned := floor(p_amount * v_cfg.points_per_currency)::int;

  if p_points_used > v_guest.points then
    raise exception 'Insufficient points';
  end if;

  update guests
    set points         = points + v_earned - p_points_used,
        lifetime_spent = lifetime_spent + p_amount,
        last_visit_at  = now(),
        visit_count    = visit_count + 1
    where id = p_guest_id
    returning * into v_guest;

  insert into guest_orders (guest_id, order_id, table_id, total_amount, points_earned, points_used)
    values (p_guest_id, p_order_id, p_table_id, p_amount, v_earned, p_points_used);

  return query select v_guest.points, v_earned;
end;
$$;

-- Auto-generate referral code on guest insert
create or replace function public.fn_set_referral_code()
returns trigger language plpgsql as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(
      regexp_replace(coalesce(split_part(new.name, ' ', 1), 'GUEST'), '[^A-Za-z0-9]', '', 'g')
    ) || '-' || upper(substr(md5(new.id::text), 1, 4));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guests_referral_code on public.guests;
create trigger trg_guests_referral_code
  before insert on public.guests
  for each row execute function public.fn_set_referral_code();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.restaurants          enable row level security;
alter table public.ads                  enable row level security;
alter table public.ad_impressions       enable row level security;
alter table public.charge_sessions      enable row level security;
alter table public.loyalty_config       enable row level security;
alter table public.guests               enable row level security;
alter table public.guest_sessions       enable row level security;
alter table public.guest_orders         enable row level security;
alter table public.guest_favorites      enable row level security;
alter table public.referrals            enable row level security;
alter table public.ai_suggestions_cache enable row level security;

-- Public reads (kiosk runs as anon)
drop policy if exists "anon read restaurants" on public.restaurants;
create policy "anon read restaurants" on public.restaurants
  for select using (true);

drop policy if exists "anon read active ads" on public.ads;
create policy "anon read active ads" on public.ads
  for select using (
    active = true
    and (ends_at is null or ends_at > now())
    and starts_at <= now()
  );

drop policy if exists "anon insert impressions" on public.ad_impressions;
create policy "anon insert impressions" on public.ad_impressions
  for insert with check (true);

drop policy if exists "anon manage charge sessions" on public.charge_sessions;
create policy "anon manage charge sessions" on public.charge_sessions
  for all using (true) with check (true);

drop policy if exists "anon read loyalty config" on public.loyalty_config;
create policy "anon read loyalty config" on public.loyalty_config
  for select using (true);

-- Guests can read/update their own row only
drop policy if exists "guest read self" on public.guests;
create policy "guest read self" on public.guests
  for select using (auth.uid() = auth_user_id);

drop policy if exists "guest update self" on public.guests;
create policy "guest update self" on public.guests
  for update using (auth.uid() = auth_user_id);

-- Sessions: anon can read (tokens are unguessable UUIDs), authed users insert
drop policy if exists "anon read sessions" on public.guest_sessions;
create policy "anon read sessions" on public.guest_sessions
  for select using (true);

drop policy if exists "auth insert session" on public.guest_sessions;
create policy "auth insert session" on public.guest_sessions
  for insert with check (auth.uid() is not null);

-- =====================================================================
-- REALTIME (kiosk subscribes to guest_sessions changes for its table)
-- =====================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'guest_sessions'
  ) then
    alter publication supabase_realtime add table public.guest_sessions;
  end if;
end $$;

-- =====================================================================
-- DONE — Verify with:
--   select tablename from pg_tables where schemaname='public' order by tablename;
-- Expected new tables: restaurants, ads, ad_impressions, charge_sessions,
--   loyalty_config, guests, guest_sessions, guest_orders, guest_favorites,
--   referrals, ai_suggestions_cache
-- =====================================================================
