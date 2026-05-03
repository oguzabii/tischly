-- =====================================================================
-- Tischly v0.4 — Menu Items + Offers
-- Run AFTER 01_tischly_full.sql
-- =====================================================================

-- Drop old (broken) tables first so we start clean
drop table if exists public.offers cascade;
drop table if exists public.menu_items cascade;

-- =====================================================================
-- 1. MENU ITEMS TABLE
-- =====================================================================
create table public.menu_items (
  id            text primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  category      text not null,
  name          jsonb not null default '{}',
  description   jsonb not null default '{}',
  price         numeric not null,
  image_url     text,
  extras        jsonb not null default '[]',
  tags          text[] default '{}',
  available     boolean not null default true,
  calories      integer,
  allergens     text[] default '{}',
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

create index if not exists menu_items_restaurant_cat_idx
  on public.menu_items (restaurant_id, category, sort_order);

alter table public.menu_items enable row level security;

drop policy if exists "anon read menu items" on public.menu_items;
create policy "anon read menu items" on public.menu_items
  for select using (true);

drop policy if exists "service role manage menu items" on public.menu_items;
create policy "service role manage menu items" on public.menu_items
  for all using (true) with check (true);

-- =====================================================================
-- 2. OFFERS TABLE
-- =====================================================================
create table public.offers (
  id            text primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  title         jsonb not null default '{}',
  description   jsonb not null default '{}',
  discount      numeric not null default 0,
  discount_type text not null default 'percent',
  image_url     text,
  valid_until   date,
  code          text,
  active        boolean not null default true,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

create index if not exists offers_restaurant_idx
  on public.offers (restaurant_id, active);

alter table public.offers enable row level security;

drop policy if exists "anon read active offers" on public.offers;
create policy "anon read active offers" on public.offers
  for select using (active = true);

drop policy if exists "service role manage offers" on public.offers;
create policy "service role manage offers" on public.offers
  for all using (true) with check (true);

-- =====================================================================
-- 3. SEED DATA (using DO block to avoid array type issues)
-- =====================================================================
do $$
declare
  v_rid uuid;
begin
  select id into v_rid from public.restaurants where slug = 'tischly-demo';
  if v_rid is null then
    raise notice 'Demo restaurant not found, skipping seed';
    return;
  end if;

  -- BURGERS
  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('burger-1', v_rid, 'burger',
    '{"de":"Classic Burger","en":"Classic Burger","tr":"Klasik Burger","fr":"Burger Classique","it":"Burger Classico","es":"Hamburguesa Clásica"}'::jsonb,
    '{"de":"Saftiges Rindfleisch, Salat, Tomate, Zwiebel, Gurke, Ketchup","en":"Juicy beef, lettuce, tomato, onion, pickle, ketchup","tr":"Sulu dana eti, marul, domates, soğan, turşu, ketçap","fr":"Bœuf juteux, salade, tomate, oignon, cornichon, ketchup","it":"Manzo succoso, lattuga, pomodoro, cipolla, cetriolino, ketchup","es":"Carne jugosa, lechuga, tomate, cebolla, pepinillo, ketchup"}'::jsonb,
    14.90,
    '[{"id":"x1","name":"Extra Käse","price":1.50},{"id":"x2","name":"Bacon","price":2.00},{"id":"x3","name":"Avocado","price":2.50}]'::jsonb,
    array['popular']::text[], true, 620, array['Gluten','Milch','Ei']::text[], 1)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('burger-2', v_rid, 'burger',
    '{"de":"BBQ Burger","en":"BBQ Burger","tr":"BBQ Burger","fr":"Burger BBQ","it":"Burger BBQ","es":"Hamburguesa BBQ"}'::jsonb,
    '{"de":"Rindfleisch, BBQ-Sauce, Bacon, Cheddar, Röstzwiebeln","en":"Beef, BBQ sauce, bacon, cheddar, crispy onions","tr":"Dana eti, BBQ sos, bacon, çedar, çıtır soğan","fr":"Bœuf, sauce BBQ, bacon, cheddar, oignons frits","it":"Manzo, salsa BBQ, bacon, cheddar, cipolle croccanti","es":"Carne, salsa BBQ, bacon, cheddar, cebollas crujientes"}'::jsonb,
    17.90,
    '[{"id":"x1","name":"Extra Käse","price":1.50},{"id":"x4","name":"Jalapeños","price":1.00}]'::jsonb,
    array['popular','spicy']::text[], true, 780, array['Gluten','Milch']::text[], 2)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('burger-3', v_rid, 'burger',
    '{"de":"Veggie Burger","en":"Veggie Burger","tr":"Sebze Burger","fr":"Burger Végétarien","it":"Burger Veggie","es":"Hamburguesa Vegetal"}'::jsonb,
    '{"de":"Hausgemachter Gemüsepatty, Avocado, Sprossen, Senf","en":"Homemade veggie patty, avocado, sprouts, mustard","tr":"Ev yapımı sebze köftesi, avokado, filiz, hardal","fr":"Galette végétarienne maison, avocat, pousses, moutarde","it":"Polpetta vegetale fatta in casa, avocado, germogli, senape","es":"Hamburguesa vegetal casera, aguacate, brotes, mostaza"}'::jsonb,
    15.90,
    '[{"id":"x3","name":"Avocado","price":2.50},{"id":"x5","name":"Extra Patty","price":3.00}]'::jsonb,
    array['vegetarian','new']::text[], true, 480, array['Gluten','Senf']::text[], 3)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('burger-4', v_rid, 'burger',
    '{"de":"Smash Burger","en":"Smash Burger","tr":"Smash Burger","fr":"Smash Burger","it":"Smash Burger","es":"Smash Burger"}'::jsonb,
    '{"de":"Doppeltes Rindfleisch, American Cheese, spezielle Soße","en":"Double beef, American cheese, special sauce","tr":"Çift dana eti, amerikan peyniri, özel sos","fr":"Double bœuf, fromage américain, sauce spéciale","it":"Doppio manzo, formaggio americano, salsa speciale","es":"Carne doble, queso americano, salsa especial"}'::jsonb,
    19.90,
    '[{"id":"x2","name":"Bacon","price":2.00},{"id":"x4","name":"Jalapeños","price":1.00}]'::jsonb,
    array['new','popular']::text[], true, 890, array['Gluten','Milch']::text[], 4)
  on conflict (id) do nothing;

  -- PIZZA
  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('pizza-1', v_rid, 'pizza',
    '{"de":"Margherita","en":"Margherita","tr":"Margarita","fr":"Margherita","it":"Margherita","es":"Margarita"}'::jsonb,
    '{"de":"Tomatensauce, Mozzarella, frisches Basilikum","en":"Tomato sauce, mozzarella, fresh basil","tr":"Domates sosu, mozzarella, taze fesleğen","fr":"Sauce tomate, mozzarella, basilic frais","it":"Salsa di pomodoro, mozzarella, basilico fresco","es":"Salsa de tomate, mozzarella, albahaca fresca"}'::jsonb,
    13.90,
    '[{"id":"p1","name":"Extra Mozzarella","price":2.00},{"id":"p2","name":"Oliven","price":1.50}]'::jsonb,
    array['vegetarian','popular']::text[], true, 720, array['Gluten','Milch']::text[], 1)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('pizza-2', v_rid, 'pizza',
    '{"de":"Diavola","en":"Diavola","tr":"Şeytan Pizza","fr":"Diavola","it":"Diavola","es":"Diávola"}'::jsonb,
    '{"de":"Tomatensauce, Mozzarella, Salami piccante, Chili","en":"Tomato sauce, mozzarella, spicy salami, chili","tr":"Domates sosu, mozzarella, acı salam, biber","fr":"Sauce tomate, mozzarella, salami épicé, piment","it":"Salsa di pomodoro, mozzarella, salame piccante, peperoncino","es":"Salsa de tomate, mozzarella, salami picante, chile"}'::jsonb,
    16.90,
    '[{"id":"p3","name":"Extra Salami","price":2.50},{"id":"p4","name":"Champignons","price":1.50}]'::jsonb,
    array['spicy','popular']::text[], true, 840, array['Gluten','Milch']::text[], 2)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('pizza-3', v_rid, 'pizza',
    '{"de":"Quattro Stagioni","en":"Quattro Stagioni","tr":"Dört Mevsim","fr":"Quatre Saisons","it":"Quattro Stagioni","es":"Cuatro Estaciones"}'::jsonb,
    '{"de":"Artischocken, Schinken, Pilze, Oliven, Mozzarella","en":"Artichokes, ham, mushrooms, olives, mozzarella","tr":"Enginar, jambon, mantar, zeytin, mozzarella","fr":"Artichauts, jambon, champignons, olives, mozzarella","it":"Carciofi, prosciutto, funghi, olive, mozzarella","es":"Alcachofas, jamón, champiñones, aceitunas, mozzarella"}'::jsonb,
    17.90, '[]'::jsonb,
    array[]::text[], true, 780, array['Gluten','Milch']::text[], 3)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('pizza-4', v_rid, 'pizza',
    '{"de":"Vegan Pizza","en":"Vegan Pizza","tr":"Vegan Pizza","fr":"Pizza Vegan","it":"Pizza Vegana","es":"Pizza Vegana"}'::jsonb,
    '{"de":"Tomatensauce, veganer Käse, Gemüse der Saison","en":"Tomato sauce, vegan cheese, seasonal vegetables","tr":"Domates sosu, vegan peynir, mevsim sebzeleri","fr":"Sauce tomate, fromage vegan, légumes de saison","it":"Salsa di pomodoro, formaggio vegano, verdure di stagione","es":"Salsa de tomate, queso vegano, verduras de temporada"}'::jsonb,
    15.90, '[]'::jsonb,
    array['vegan','new']::text[], true, 560, array['Gluten']::text[], 4)
  on conflict (id) do nothing;

  -- DRINKS
  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('drink-1', v_rid, 'drinks',
    '{"de":"Cola","en":"Cola","tr":"Kola","fr":"Coca-Cola","it":"Coca-Cola","es":"Coca-Cola"}'::jsonb,
    '{"de":"Klassische Cola, 0.5l","en":"Classic cola, 0.5l","tr":"Klasik kola, 0.5l","fr":"Coca-Cola classique, 0.5l","it":"Coca-Cola classica, 0.5l","es":"Coca-Cola clásica, 0.5l"}'::jsonb,
    4.50, '[]'::jsonb, array['popular']::text[], true, 180, array[]::text[], 1)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('drink-2', v_rid, 'drinks',
    '{"de":"Mineralwasser","en":"Mineral Water","tr":"Maden Suyu","fr":"Eau minérale","it":"Acqua minerale","es":"Agua mineral"}'::jsonb,
    '{"de":"Still oder sprudelnd, 0.5l","en":"Still or sparkling, 0.5l","tr":"Sade veya gazlı, 0.5l","fr":"Plate ou gazeuse, 0.5l","it":"Naturale o frizzante, 0.5l","es":"Sin gas o con gas, 0.5l"}'::jsonb,
    3.50, '[]'::jsonb, array[]::text[], true, 0, array[]::text[], 2)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('drink-3', v_rid, 'drinks',
    '{"de":"Bier vom Fass","en":"Draft Beer","tr":"Fıçı Bira","fr":"Bière pression","it":"Birra alla spina","es":"Cerveza de barril"}'::jsonb,
    '{"de":"Frisch gezapftes Bier, 0.5l","en":"Freshly tapped beer, 0.5l","tr":"Taze çekilen bira, 0.5l","fr":"Bière fraîche, 0.5l","it":"Birra fresca alla spina, 0.5l","es":"Cerveza fresca de barril, 0.5l"}'::jsonb,
    6.50, '[]'::jsonb, array['popular']::text[], true, 215, array[]::text[], 3)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('drink-4', v_rid, 'drinks',
    '{"de":"Frischer Orangensaft","en":"Fresh Orange Juice","tr":"Taze Portakal Suyu","fr":"Jus d''orange frais","it":"Succo d''arancia fresco","es":"Zumo de naranja fresco"}'::jsonb,
    '{"de":"Frisch gepresst, 0.3l","en":"Freshly squeezed, 0.3l","tr":"Taze sıkılmış, 0.3l","fr":"Fraîchement pressé, 0.3l","it":"Appena spremuto, 0.3l","es":"Recién exprimido, 0.3l"}'::jsonb,
    5.50, '[]'::jsonb, array[]::text[], true, 110, array[]::text[], 4)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('drink-5', v_rid, 'drinks',
    '{"de":"Kaffee","en":"Coffee","tr":"Kahve","fr":"Café","it":"Caffè","es":"Café"}'::jsonb,
    '{"de":"Espresso, Cappuccino oder Latte","en":"Espresso, cappuccino or latte","tr":"Espresso, kapuçino veya latte","fr":"Espresso, cappuccino ou latte","it":"Espresso, cappuccino o latte","es":"Espresso, capuchino o latte"}'::jsonb,
    4.00, '[]'::jsonb, array[]::text[], true, 5, array[]::text[], 5)
  on conflict (id) do nothing;

  -- DESSERTS
  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('dessert-1', v_rid, 'desserts',
    '{"de":"Tiramisu","en":"Tiramisu","tr":"Tiramisu","fr":"Tiramisu","it":"Tiramisù","es":"Tiramisú"}'::jsonb,
    '{"de":"Klassisches Tiramisu mit Mascarpone","en":"Classic tiramisu with mascarpone","tr":"Mascarpone ile klasik tiramisu","fr":"Tiramisu classique à la mascarpone","it":"Tiramisù classico con mascarpone","es":"Tiramisú clásico con mascarpone"}'::jsonb,
    8.90, '[]'::jsonb, array['popular']::text[], true, 380, array['Milch','Ei','Gluten']::text[], 1)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('dessert-2', v_rid, 'desserts',
    '{"de":"Lava Cake","en":"Lava Cake","tr":"Lav Kek","fr":"Fondant au Chocolat","it":"Tortino al Cioccolato","es":"Coulant de Chocolate"}'::jsonb,
    '{"de":"Warmer Schokoladenkuchen mit flüssigem Kern","en":"Warm chocolate cake with liquid center","tr":"Sıcak çikolatalı kek, sıvı merkez","fr":"Gâteau au chocolat chaud avec cœur coulant","it":"Tortino di cioccolato caldo con cuore fondente","es":"Pastel de chocolate caliente con centro líquido"}'::jsonb,
    9.90,
    '[{"id":"d1","name":"Vanilleeis","price":2.50}]'::jsonb,
    array['popular','new']::text[], true, 450, array['Milch','Ei','Gluten']::text[], 2)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('dessert-3', v_rid, 'desserts',
    '{"de":"Sorbet","en":"Sorbet","tr":"Sorbe","fr":"Sorbet","it":"Sorbetto","es":"Sorbete"}'::jsonb,
    '{"de":"Drei Kugeln: Zitrone, Mango, Erdbeer","en":"Three scoops: lemon, mango, strawberry","tr":"Üç top: limon, mango, çilek","fr":"Trois boules: citron, mangue, fraise","it":"Tre palline: limone, mango, fragola","es":"Tres bolas: limón, mango, fresa"}'::jsonb,
    7.90, '[]'::jsonb, array['vegan','glutenFree']::text[], true, 210, array[]::text[], 3)
  on conflict (id) do nothing;

  insert into public.menu_items (id, restaurant_id, category, name, description, price, extras, tags, available, calories, allergens, sort_order) values
  ('dessert-4', v_rid, 'desserts',
    '{"de":"Cheesecake","en":"Cheesecake","tr":"Cheesecake","fr":"Cheesecake","it":"Cheesecake","es":"Tarta de Queso"}'::jsonb,
    '{"de":"New Yorker Cheesecake mit Beerenkompott","en":"New York cheesecake with berry compote","tr":"New York cheesecake, meyve kompostu","fr":"Cheesecake new-yorkais avec compote de baies","it":"Cheesecake alla New York con composta di frutti di bosco","es":"Cheesecake de Nueva York con compota de frutos rojos"}'::jsonb,
    8.50, '[]'::jsonb, array[]::text[], true, 420, array['Milch','Ei','Gluten']::text[], 4)
  on conflict (id) do nothing;

  -- OFFERS
  insert into public.offers (id, restaurant_id, title, description, discount, discount_type, valid_until, code, active, sort_order) values
  ('offer-1', v_rid,
    '{"de":"Happy Hour","en":"Happy Hour","tr":"Mutlu Saat","fr":"Happy Hour","it":"Happy Hour","es":"Happy Hour"}'::jsonb,
    '{"de":"20% Rabatt auf alle Getränke von 15–18 Uhr","en":"20% off all drinks from 3–6pm","tr":"Saat 15-18 arası tüm içeceklerde %20 indirim","fr":"20% de réduction sur toutes les boissons de 15h à 18h","it":"20% di sconto su tutte le bevande dalle 15 alle 18","es":"20% de descuento en bebidas de 15 a 18h"}'::jsonb,
    20, 'percent', '2026-12-31'::date, null, true, 1)
  on conflict (id) do nothing;

  insert into public.offers (id, restaurant_id, title, description, discount, discount_type, valid_until, code, active, sort_order) values
  ('offer-2', v_rid,
    '{"de":"Familien-Deal","en":"Family Deal","tr":"Aile Fırsatı","fr":"Offre Famille","it":"Offerta Famiglia","es":"Oferta Familiar"}'::jsonb,
    '{"de":"4 Burger + 4 Getränke für CHF 59.–","en":"4 burgers + 4 drinks for CHF 59.–","tr":"4 burger + 4 içecek 59 CHF","fr":"4 burgers + 4 boissons pour CHF 59.–","it":"4 burger + 4 bevande per CHF 59.–","es":"4 hamburguesas + 4 bebidas por CHF 59.–"}'::jsonb,
    59, 'fixed', '2026-06-30'::date, 'FAMILY24', true, 2)
  on conflict (id) do nothing;

  insert into public.offers (id, restaurant_id, title, description, discount, discount_type, valid_until, code, active, sort_order) values
  ('offer-3', v_rid,
    '{"de":"Geburtstags-Special","en":"Birthday Special","tr":"Doğum Günü Özel","fr":"Spécial Anniversaire","it":"Speciale Compleanno","es":"Especial Cumpleaños"}'::jsonb,
    '{"de":"Gratis Dessert an Ihrem Geburtstag","en":"Free dessert on your birthday","tr":"Doğum günün bedava tatlı","fr":"Dessert gratuit pour votre anniversaire","it":"Dessert gratis nel giorno del tuo compleanno","es":"Postre gratis en tu cumpleaños"}'::jsonb,
    100, 'percent', '2026-12-31'::date, null, true, 3)
  on conflict (id) do nothing;

end $$;

-- =====================================================================
-- DONE — verify with:
--   select count(*) from menu_items;   -- should be 17
--   select count(*) from offers;       -- should be 3
-- =====================================================================
