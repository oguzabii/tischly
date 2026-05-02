-- Tischly Supabase Schema

-- Tables
create table if not exists tables (
  id         text primary key,
  number     integer not null unique,
  status     text not null default 'free' check (status in ('free', 'occupied', 'reserved')),
  seats      integer not null default 4,
  created_at timestamptz default now()
);

-- Menu items
create table if not exists menu_items (
  id          text primary key,
  category    text not null check (category in ('burger', 'pizza', 'drinks', 'desserts')),
  name_de     text not null,
  name_en     text,
  name_tr     text,
  name_fr     text,
  name_it     text,
  name_es     text,
  desc_de     text,
  desc_en     text,
  desc_tr     text,
  desc_fr     text,
  desc_it     text,
  desc_es     text,
  price       numeric(8,2) not null,
  image       text,
  tags        text[] default '{}',
  available   boolean default true,
  calories    integer,
  allergens   text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Extras
create table if not exists extras (
  id            text primary key,
  menu_item_id  text references menu_items(id) on delete cascade,
  name          text not null,
  price         numeric(6,2) not null default 0
);

-- Orders
create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  table_id    text references tables(id),
  status      text not null default 'pending' check (status in ('pending', 'preparing', 'ready', 'delivered', 'paid')),
  total       numeric(10,2) not null default 0,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Order items
create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  menu_item_id  text references menu_items(id),
  quantity      integer not null default 1,
  unit_price    numeric(8,2) not null,
  extras        jsonb default '[]',
  notes         text,
  created_at    timestamptz default now()
);

-- Service requests
create table if not exists service_requests (
  id          uuid primary key default gen_random_uuid(),
  table_id    text references tables(id),
  type        text not null check (type in ('callWaiter', 'requestWater', 'requestBill', 'needHelp')),
  status      text not null default 'pending' check (status in ('pending', 'done')),
  created_at  timestamptz default now()
);

-- Offers
create table if not exists offers (
  id             text primary key,
  title_de       text not null,
  title_en       text,
  desc_de        text,
  desc_en        text,
  discount       numeric(8,2) not null,
  discount_type  text check (discount_type in ('percent', 'fixed')),
  image          text,
  valid_until    date,
  code           text,
  active         boolean default true,
  created_at     timestamptz default now()
);

-- Daily special
create table if not exists daily_special (
  id             uuid primary key default gen_random_uuid(),
  menu_item_id   text references menu_items(id),
  note_de        text,
  note_en        text,
  active_date    date not null default current_date
);

-- RLS Policies (basic)
alter table tables         enable row level security;
alter table menu_items     enable row level security;
alter table extras         enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;
alter table service_requests enable row level security;
alter table offers         enable row level security;
alter table daily_special  enable row level security;

-- Allow anon read for menu/offers/daily
create policy "Public read menu_items"   on menu_items     for select using (true);
create policy "Public read extras"       on extras         for select using (true);
create policy "Public read offers"       on offers         for select using (active = true);
create policy "Public read daily"        on daily_special  for select using (active_date = current_date);
create policy "Public read tables"       on tables         for select using (true);

-- Allow anon insert for orders / service requests
create policy "Anon insert orders"       on orders          for insert with check (true);
create policy "Anon insert order_items"  on order_items     for insert with check (true);
create policy "Anon insert service"      on service_requests for insert with check (true);

-- Seed tables 1-12
insert into tables (id, number, status, seats) values
  ('table-1', 1, 'occupied', 4), ('table-2', 2, 'occupied', 2), ('table-3', 3, 'occupied', 6),
  ('table-4', 4, 'reserved', 4), ('table-5', 5, 'free', 4), ('table-6', 6, 'free', 4),
  ('table-7', 7, 'free', 2), ('table-8', 8, 'free', 6), ('table-9', 9, 'free', 4),
  ('table-10', 10, 'free', 4), ('table-11', 11, 'free', 2), ('table-12', 12, 'free', 6)
on conflict (id) do nothing;
