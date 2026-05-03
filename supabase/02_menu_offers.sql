-- =====================================================================
-- Tischly v0.4 — Menu Items + Offers (run after 01_tischly_full.sql)
-- =====================================================================

-- =====================================================================
-- 1. MENU ITEMS
-- =====================================================================
create table if not exists public.menu_items (
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
-- 2. OFFERS
-- =====================================================================
create table if not exists public.offers (
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
-- 3. SEED MENU ITEMS (Demo Restaurant)
-- =====================================================================
insert into public.menu_items (id, restaurant_id, category, name, description, price, image_url, extras, tags, available, calories, allergens, sort_order)
select v.id, r.id, v.category, v.name::jsonb, v.description::jsonb, v.price, v.image_url, v.extras::jsonb, v.tags, v.available, v.calories, v.allergens, v.sort_order
from public.restaurants r,
(values
  ('burger-1','burger',
   '{"de":"Classic Burger","en":"Classic Burger","tr":"Klasik Burger","fr":"Burger Classique","it":"Burger Classico","es":"Hamburguesa Clásica"}',
   '{"de":"Saftiges Rindfleisch, Salat, Tomate, Zwiebel, Gurke, Ketchup","en":"Juicy beef, lettuce, tomato, onion, pickle, ketchup","tr":"Sulu dana eti, marul, domates, soğan, turşu, ketçap","fr":"Bœuf juteux, salade, tomate, oignon, cornichon, ketchup","it":"Manzo succoso, lattuga, pomodoro, cipolla, cetriolino, ketchup","es":"Carne jugosa, lechuga, tomate, cebolla, pepinillo, ketchup"}',
   14.90, null,
   '[{"id":"x1","name":"Extra Käse","price":1.50},{"id":"x2","name":"Bacon","price":2.00},{"id":"x3","name":"Avocado","price":2.50}]',
   ARRAY['popular'], true, 620, ARRAY['Gluten','Milch','Ei'], 1),
  ('burger-2','burger',
   '{"de":"BBQ Burger","en":"BBQ Burger","tr":"BBQ Burger","fr":"Burger BBQ","it":"Burger BBQ","es":"Hamburguesa BBQ"}',
   '{"de":"Rindfleisch, BBQ-Sauce, Bacon, Cheddar, Röstzwiebeln","en":"Beef, BBQ sauce, bacon, cheddar, crispy onions","tr":"Dana eti, BBQ sos, bacon, çedar, çıtır soğan","fr":"Bœuf, sauce BBQ, bacon, cheddar, oignons frits","it":"Manzo, salsa BBQ, bacon, cheddar, cipolle croccanti","es":"Carne, salsa BBQ, bacon, cheddar, cebollas crujientes"}',
   17.90, null,
   '[{"id":"x1","name":"Extra Käse","price":1.50},{"id":"x4","name":"Jalapeños","price":1.00}]',
   ARRAY['popular','spicy'], true, 780, ARRAY['Gluten','Milch'], 2),
  ('burger-3','burger',
   '{"de":"Veggie Burger","en":"Veggie Burger","tr":"Sebze Burger","fr":"Burger Végétarien","it":"Burger Veggie","es":"Hamburguesa Vegetal"}',
   '{"de":"Hausgemachter Gemüsepatty, Avocado, Sprossen, Senf","en":"Homemade veggie patty, avocado, sprouts, mustard","tr":"Ev yapımı sebze köftesi, avokado, filiz, hardal","fr":"Galette végétarienne maison, avocat, pousses, moutarde","it":"Polpetta vegetale fatta in casa, avocado, germogli, senape","es":"Hamburguesa vegetal casera, aguacate, brotes, mostaza"}',
   15.90, null,
   '[{"id":"x3","name":"Avocado","price":2.50},{"id":"x5","name":"Extra Patty","price":3.00}]',
   ARRAY['vegetarian','new'], true, 480, ARRAY['Gluten','Senf'], 3),
  ('burger-4','burger',
   '{"de":"Smash Burger","en":"Smash Burger","tr":"Smash Burger","fr":"Smash Burger","it":"Smash Burger","es":"Smash Burger"}',
   '{"de":"Doppeltes Rindfleisch, American Cheese, spezielle Soße","en":"Double beef, American cheese, special sauce","tr":"Çift dana eti, amerikan peyniri, özel sos","fr":"Double bœuf, fromage américain, sauce spéciale","it":"Doppio manzo, formaggio americano, salsa speciale","es":"Carne doble, queso americano, salsa especial"}',
   19.90, null,
   '[{"id":"x2","name":"Bacon","price":2.00},{"id":"x4","name":"Jalapeños","price":1.00}]',
   ARRAY['new','popular'], true, 890, ARRAY['Gluten','Milch'], 4),
  ('pizza-1','pizza',
   '{"de":"Margherita","en":"Margherita","tr":"Margarita","fr":"Margherita","it":"Margherita","es":"Margarita"}',
   '{"de":"Tomatensauce, Mozzarella, frisches Basilikum","en":"Tomato sauce, mozzarella, fresh basil","tr":"Domates sosu, mozzarella, taze fesleğen","fr":"Sauce tomate, mozzarella, basilic frais","it":"Salsa di pomodoro, mozzarella, basilico fresco","es":"Salsa de tomate, mozzarella, albahaca fresca"}',
   13.90, null,
   '[{"id":"p1","name":"Extra Mozzarella","price":2.00},{"id":"p2","name":"Oliven","price":1.50}]',
   ARRAY['vegetarian','popular'], true, 720, ARRAY['Gluten','Milch'], 1),
  ('pizza-2','pizza',
   '{"de":"Diavola","en":"Diavola","tr":"Şeytan Pizza","fr":"Diavola","it":"Diavola","es":"Diávola"}',
   '{"de":"Tomatensauce, Mozzarella, Salami piccante, Chili","en":"Tomato sauce, mozzarella, spicy salami, chili","tr":"Domates sosu, mozzarella, acı salam, biber","fr":"Sauce tomate, mozzarella, salami épicé, piment","it":"Salsa di pomodoro, mozzarella, salame piccante, peperoncino","es":"Salsa de tomate, mozzarella, salami picante, chile"}',
   16.90, null,
   '[{"id":"p3","name":"Extra Salami","price":2.50},{"id":"p4","name":"Champignons","price":1.50}]',
   ARRAY['spicy','popular'], true, 840, ARRAY['Gluten','Milch'], 2),
  ('pizza-3','pizza',
   '{"de":"Quattro Stagioni","en":"Quattro Stagioni","tr":"Dört Mevsim","fr":"Quatre Saisons","it":"Quattro Stagioni","es":"Cuatro Estaciones"}',
   '{"de":"Artischocken, Schinken, Pilze, Oliven, Mozzarella","en":"Artichokes, ham, mushrooms, olives, mozzarella","tr":"Enginar, jambon, mantar, zeytin, mozzarella","fr":"Artichauts, jambon, champignons, olives, mozzarella","it":"Carciofi, prosciutto, funghi, olive, mozzarella","es":"Alcachofas, jamón, champiñones, aceitunas, mozzarella"}',
   17.90, null, '[]',
   ARRAY[]::text[], true, 780, ARRAY['Gluten','Milch'], 3),
  ('pizza-4','pizza',
   '{"de":"Vegan Pizza","en":"Vegan Pizza","tr":"Vegan Pizza","fr":"Pizza Vegan","it":"Pizza Vegana","es":"Pizza Vegana"}',
   '{"de":"Tomatensauce, veganer Käse, Gemüse der Saison","en":"Tomato sauce, vegan cheese, seasonal vegetables","tr":"Domates sosu, vegan peynir, mevsim sebzeleri","fr":"Sauce tomate, fromage vegan, légumes de saison","it":"Salsa di pomodoro, formaggio vegano, verdure di stagione","es":"Salsa de tomate, queso vegano, verduras de temporada"}',
   15.90, null, '[]',
   ARRAY['vegan','new'], true, 560, ARRAY['Gluten'], 4),
  ('drink-1','drinks',
   '{"de":"Cola","en":"Cola","tr":"Kola","fr":"Coca-Cola","it":"Coca-Cola","es":"Coca-Cola"}',
   '{"de":"Klassische Cola, 0.5l","en":"Classic cola, 0.5l","tr":"Klasik kola, 0.5l","fr":"Coca-Cola classique, 0.5l","it":"Coca-Cola classica, 0.5l","es":"Coca-Cola clásica, 0.5l"}',
   4.50, null, '[]',
   ARRAY['popular'], true, 180, ARRAY[]::text[], 1),
  ('drink-2','drinks',
   '{"de":"Mineralwasser","en":"Mineral Water","tr":"Maden Suyu","fr":"Eau minérale","it":"Acqua minerale","es":"Agua mineral"}',
   '{"de":"Still oder sprudelnd, 0.5l","en":"Still or sparkling, 0.5l","tr":"Sade veya gazlı, 0.5l","fr":"Plate ou gazeuse, 0.5l","it":"Naturale o frizzante, 0.5l","es":"Sin gas o con gas, 0.5l"}',
   3.50, null, '[]',
   ARRAY[]::text[], true, 0, ARRAY[]::text[], 2),
  ('drink-3','drinks',
   '{"de":"Bier vom Fass","en":"Draft Beer","tr":"Fıçı Bira","fr":"Bière pression","it":"Birra alla spina","es":"Cerveza de barril"}',
   '{"de":"Frisch gezapftes Bier, 0.5l","en":"Freshly tapped beer, 0.5l","tr":"Taze çekilen bira, 0.5l","fr":"Bière fraîche, 0.5l","it":"Birra fresca alla spina, 0.5l","es":"Cerveza fresca de barril, 0.5l"}',
   6.50, null, '[]',
   ARRAY['popular'], true, 215, ARRAY[]::text[], 3),
  ('drink-4','drinks',
   '{"de":"Frischer Orangensaft","en":"Fresh Orange Juice","tr":"Taze Portakal Suyu","fr":"Jus d''orange frais","it":"Succo d''arancia fresco","es":"Zumo de naranja fresco"}',
   '{"de":"Frisch gepresst, 0.3l","en":"Freshly squeezed, 0.3l","tr":"Taze sıkılmış, 0.3l","fr":"Fraîchement pressé, 0.3l","it":"Appena spremuto, 0.3l","es":"Recién exprimido, 0.3l"}',
   5.50, null, '[]',
   ARRAY[]::text[], true, 110, ARRAY[]::text[], 4),
  ('drink-5','drinks',
   '{"de":"Kaffee","en":"Coffee","tr":"Kahve","fr":"Café","it":"Caffè","es":"Café"}',
   '{"de":"Espresso, Cappuccino oder Latte","en":"Espresso, cappuccino or latte","tr":"Espresso, kapuçino veya latte","fr":"Espresso, cappuccino ou latte","it":"Espresso, cappuccino o latte","es":"Espresso, capuchino o latte"}',
   4.00, null, '[]',
   ARRAY[]::text[], true, 5, ARRAY[]::text[], 5),
  ('dessert-1','desserts',
   '{"de":"Tiramisu","en":"Tiramisu","tr":"Tiramisu","fr":"Tiramisu","it":"Tiramisù","es":"Tiramisú"}',
   '{"de":"Klassisches Tiramisu mit Mascarpone","en":"Classic tiramisu with mascarpone","tr":"Mascarpone ile klasik tiramisu","fr":"Tiramisu classique à la mascarpone","it":"Tiramisù classico con mascarpone","es":"Tiramisú clásico con mascarpone"}',
   8.90, null, '[]',
   ARRAY['popular'], true, 380, ARRAY['Milch','Ei','Gluten'], 1),
  ('dessert-2','desserts',
   '{"de":"Lava Cake","en":"Lava Cake","tr":"Lav Kek","fr":"Fondant au Chocolat","it":"Tortino al Cioccolato","es":"Coulant de Chocolate"}',
   '{"de":"Warmer Schokoladenkuchen mit flüssigem Kern","en":"Warm chocolate cake with liquid center","tr":"Sıcak çikolatalı kek, sıvı merkez","fr":"Gâteau au chocolat chaud avec cœur coulant","it":"Tortino di cioccolato caldo con cuore fondente","es":"Pastel de chocolate caliente con centro líquido"}',
   9.90, null,
   '[{"id":"d1","name":"Vanilleeis","price":2.50}]',
   ARRAY['popular','new'], true, 450, ARRAY['Milch','Ei','Gluten'], 2),
  ('dessert-3','desserts',
   '{"de":"Sorbet","en":"Sorbet","tr":"Sorbe","fr":"Sorbet","it":"Sorbetto","es":"Sorbete"}',
   '{"de":"Drei Kugeln: Zitrone, Mango, Erdbeer","en":"Three scoops: lemon, mango, strawberry","tr":"Üç top: limon, mango, çilek","fr":"Trois boules: citron, mangue, fraise","it":"Tre palline: limone, mango, fragola","es":"Tres bolas: limón, mango, fresa"}',
   7.90, null, '[]',
   ARRAY['vegan','glutenFree'], true, 210, ARRAY[]::text[], 3),
  ('dessert-4','desserts',
   '{"de":"Cheesecake","en":"Cheesecake","tr":"Cheesecake","fr":"Cheesecake","it":"Cheesecake","es":"Tarta de Queso"}',
   '{"de":"New Yorker Cheesecake mit Beerenkompott","en":"New York cheesecake with berry compote","tr":"New York cheesecake, meyve kompostu","fr":"Cheesecake new-yorkais avec compote de baies","it":"Cheesecake alla New York con composta di frutti di bosco","es":"Cheesecake de Nueva York con compota de frutos rojos"}',
   8.50, null, '[]',
   ARRAY[]::text[], true, 420, ARRAY['Milch','Ei','Gluten'], 4)
) as v(id, category, name, description, price, image_url, extras, tags, available, calories, allergens, sort_order)
where r.slug = 'tischly-demo'
on conflict (id) do nothing;

-- =====================================================================
-- 4. SEED OFFERS (Demo Restaurant)
-- =====================================================================
insert into public.offers (id, restaurant_id, title, description, discount, discount_type, valid_until, code, active, sort_order)
select v.id, r.id, v.title::jsonb, v.description::jsonb, v.discount, v.discount_type, v.valid_until::date, v.code, true, v.sort_order
from public.restaurants r,
(values
  ('offer-1',
   '{"de":"Happy Hour","en":"Happy Hour","tr":"Mutlu Saat","fr":"Happy Hour","it":"Happy Hour","es":"Happy Hour"}',
   '{"de":"20% Rabatt auf alle Getränke von 15–18 Uhr","en":"20% off all drinks from 3–6pm","tr":"Saat 15-18 arası tüm içeceklerde %20 indirim","fr":"20% de réduction sur toutes les boissons de 15h à 18h","it":"20% di sconto su tutte le bevande dalle 15 alle 18","es":"20% de descuento en bebidas de 15 a 18h"}',
   20, 'percent', '2026-12-31', null, 1),
  ('offer-2',
   '{"de":"Familien-Deal","en":"Family Deal","tr":"Aile Fırsatı","fr":"Offre Famille","it":"Offerta Famiglia","es":"Oferta Familiar"}',
   '{"de":"4 Burger + 4 Getränke für CHF 59.–","en":"4 burgers + 4 drinks for CHF 59.–","tr":"4 burger + 4 içecek 59 CHF","fr":"4 burgers + 4 boissons pour CHF 59.–","it":"4 burger + 4 bevande per CHF 59.–","es":"4 hamburguesas + 4 bebidas por CHF 59.–"}',
   59, 'fixed', '2026-06-30', 'FAMILY24', 2),
  ('offer-3',
   '{"de":"Geburtstags-Special","en":"Birthday Special","tr":"Doğum Günü Özel","fr":"Spécial Anniversaire","it":"Speciale Compleanno","es":"Especial Cumpleaños"}',
   '{"de":"Gratis Dessert an Ihrem Geburtstag","en":"Free dessert on your birthday","tr":"Doğum günün bedava tatlı","fr":"Dessert gratuit pour votre anniversaire","it":"Dessert gratis nel giorno del tuo compleanno","es":"Postre gratis en tu cumpleaños"}',
   100, 'percent', '2026-12-31', null, 3)
) as v(id, title, description, discount, discount_type, valid_until, code, sort_order)
where r.slug = 'tischly-demo'
on conflict (id) do nothing;

-- =====================================================================
-- DONE
-- =====================================================================
