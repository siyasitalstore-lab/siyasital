-- ============================================================
-- MOHALLA MART - SUPABASE DATABASE SCHEMA & REAL GROCERY DATA
-- Run this script in your Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  unit text default '',
  price numeric not null default 0,
  stock integer not null default 0,
  emoji text default '🛍️',
  has_variants boolean default false,
  variants jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 2. ORDERS TABLE (100% Store Pickup)
create table if not exists public.orders (
  id text primary key,
  customer text not null,
  phone text,
  time text,
  date text,
  fulfillment text default 'pickup',
  address text,
  payment text default 'cod',
  utr text,
  notes text,
  status text default 'New',
  total numeric not null default 0,
  subtotal numeric not null default 0,
  is_parchi boolean default false,
  parchi_text text,
  parchi_image text,
  items jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 3. CUSTOMERS & CREDIT LEDGER TABLE
create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null,
  email text default '',
  address text default '',
  khata_limit numeric default 3000,
  notes text default '',
  payment_history jsonb default '[]'::jsonb,
  manual_entries jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 4. EXPENSES TABLE (Store Costs & Profit Calculation)
create table if not exists public.expenses (
  id text primary key,
  title text not null,
  category text not null,
  amount numeric not null default 0,
  date text,
  payment_method text default 'UPI',
  notes text default '',
  created_at timestamptz default now()
);

-- 5. STAFF TABLE
create table if not exists public.staff (
  id text primary key,
  name text not null,
  role text default 'Staff',
  phone text,
  active boolean default true,
  created_at timestamptz default now()
);

-- 6. BANNERS TABLE
create table if not exists public.banners (
  id text primary key,
  title text not null,
  image text not null,
  link text default '',
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allows seamless read/write access for store counter & app
-- ============================================================
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.expenses enable row level security;
alter table public.staff enable row level security;
alter table public.banners enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read access on products" on public.products;
drop policy if exists "Allow public insert/update/delete on products" on public.products;
drop policy if exists "Allow public read access on orders" on public.orders;
drop policy if exists "Allow public insert/update/delete on orders" on public.orders;
drop policy if exists "Allow public read access on customers" on public.customers;
drop policy if exists "Allow public insert/update/delete on customers" on public.customers;
drop policy if exists "Allow public read access on expenses" on public.expenses;
drop policy if exists "Allow public insert/update/delete on expenses" on public.expenses;
drop policy if exists "Allow public read access on staff" on public.staff;
drop policy if exists "Allow public insert/update/delete on staff" on public.staff;
drop policy if exists "Allow public read access on banners" on public.banners;
drop policy if exists "Allow public insert/update/delete on banners" on public.banners;

-- Open policies for development & counter POS
create policy "Allow public read access on products" on public.products for select using (true);
create policy "Allow public insert/update/delete on products" on public.products for all using (true) with check (true);

create policy "Allow public read access on orders" on public.orders for select using (true);
create policy "Allow public insert/update/delete on orders" on public.orders for all using (true) with check (true);

create policy "Allow public read access on customers" on public.customers for select using (true);
create policy "Allow public insert/update/delete on customers" on public.customers for all using (true) with check (true);

create policy "Allow public read access on expenses" on public.expenses for select using (true);
create policy "Allow public insert/update/delete on expenses" on public.expenses for all using (true) with check (true);

create policy "Allow public read access on staff" on public.staff for select using (true);
create policy "Allow public insert/update/delete on staff" on public.staff for all using (true) with check (true);

create policy "Allow public read access on banners" on public.banners for select using (true);
create policy "Allow public insert/update/delete on banners" on public.banners for all using (true) with check (true);

-- ============================================================
-- INSERT REAL GROCERY STORE CATALOG (REPLACING FAKE DATA)
-- Authentic Indian Grocery Products with Real Prices & Variants
-- ============================================================
insert into public.products (id, name, category, unit, price, stock, emoji, has_variants, variants) values
  -- Chocolates with Multi-Variants
  ('p_5star', 'Cadbury 5 Star Chocolate', 'Chips & Namkeen', 'Multiple sizes available', 5, 120, '🍫', true, '[
    {"id": "v1", "name": "Small (10g)", "unit": "10g pack", "price": 5, "stock": 45},
    {"id": "v2", "name": "Regular (20g)", "unit": "20g pack", "price": 10, "stock": 40},
    {"id": "v3", "name": "Medium (40g)", "unit": "40g pack", "price": 20, "stock": 25},
    {"id": "v4", "name": "5 Star 3D", "unit": "42g bar", "price": 35, "stock": 10}
  ]'::jsonb),

  -- Daily Essentials & Dairy
  ('p_atta', 'Aashirvaad Shudh Chakki Atta', 'Daily Essentials & Dairy', 'Available in 5kg & 10kg', 235, 60, '🌾', true, '[
    {"id": "v_att_5", "name": "5 kg Bag", "unit": "5 kg bag", "price": 235, "stock": 35},
    {"id": "v_att_10", "name": "10 kg Bag", "unit": "10 kg bag", "price": 455, "stock": 25}
  ]'::jsonb),
  ('p_oil', 'Fortune Sunlite Refined Sunflower Oil', 'Daily Essentials & Dairy', 'Available in 1L & 5L', 135, 45, '🫒', true, '[
    {"id": "v_oil_1", "name": "1 Litre Pouch", "unit": "1L pouch", "price": 135, "stock": 35},
    {"id": "v_oil_5", "name": "5 Litre Can", "unit": "5L can", "price": 680, "stock": 10}
  ]'::jsonb),
  ('p_milk_taaza', 'Amul Taaza Homogenised Toned Milk', 'Daily Essentials & Dairy', '500ml pouch', 27, 50, '🥛', false, '[]'::jsonb),
  ('p_milk_gold', 'Amul Gold Full Cream Milk', 'Daily Essentials & Dairy', '500ml pouch', 33, 40, '🥛', false, '[]'::jsonb),
  ('p_butter', 'Amul Pasteurized Salted Butter', 'Daily Essentials & Dairy', '100g pack', 58, 30, '🧈', false, '[]'::jsonb),
  ('p_paneer', 'Fresh Malai Paneer', 'Daily Essentials & Dairy', '200g pack', 90, 25, '🧀', false, '[]'::jsonb),
  ('p_curd', 'Mother Dairy Classic Dahi', 'Daily Essentials & Dairy', '400g tub', 35, 20, '🥣', false, '[]'::jsonb),
  ('p_salt', 'Tata Salt Vacuum Evaporated Iodized Salt', 'Daily Essentials & Dairy', '1 kg packet', 28, 80, '🧂', false, '[]'::jsonb),
  ('p_rice', 'India Gate Feast Rozzana Basmati Rice', 'Daily Essentials & Dairy', 'Available in 1kg & 5kg', 115, 30, '🍚', true, '[
    {"id": "v_rice_1", "name": "1 kg Pack", "unit": "1 kg pack", "price": 115, "stock": 20},
    {"id": "v_rice_5", "name": "5 kg Bag", "unit": "5 kg bag", "price": 540, "stock": 10}
  ]'::jsonb),
  ('p_dal', 'Tata Sampann Unpolished Toor Dal', 'Daily Essentials & Dairy', '1 kg packet', 185, 25, '🍲', false, '[]'::jsonb),

  -- Chips & Namkeen
  ('p_lays_magic', 'Lay''s India''s Magic Masala', 'Chips & Namkeen', '50g pack', 20, 50, '🌶️', true, '[
    {"id": "v_lay_1", "name": "Small (30g)", "unit": "30g pack", "price": 10, "stock": 25},
    {"id": "v_lay_2", "name": "Regular (50g)", "unit": "50g pack", "price": 20, "stock": 35},
    {"id": "v_lay_3", "name": "Party Pack (90g)", "unit": "90g pack", "price": 40, "stock": 15}
  ]'::jsonb),
  ('p_lays_salted', 'Lay''s Classic Salted Chips', 'Chips & Namkeen', '50g pack', 20, 40, '🍟', false, '[]'::jsonb),
  ('p_kurkure', 'Kurkure Masala Munch', 'Chips & Namkeen', 'Available in ₹10 & ₹20', 10, 60, '🌽', true, '[
    {"id": "v_kur_1", "name": "Small (45g)", "unit": "45g pack", "price": 10, "stock": 40},
    {"id": "v_kur_2", "name": "Regular (85g)", "unit": "85g pack", "price": 20, "stock": 20}
  ]'::jsonb),
  ('p_aloo_bhujia', 'Haldiram''s Nagpur Aloo Bhujia', 'Chips & Namkeen', '150g pack', 45, 30, '🥨', false, '[]'::jsonb),
  ('p_namkeen_mix', 'Haldiram''s All-In-One Mixture', 'Chips & Namkeen', '200g pack', 55, 25, '🥜', false, '[]'::jsonb),
  ('p_maggi', 'Maggi 2-Minute Masala Instant Noodles', 'Chips & Namkeen', 'Pack of 4 (280g)', 56, 45, '🍜', false, '[]'::jsonb),

  -- Cold Drinks & Beverages
  ('p_coke', 'Coca-Cola Soft Drink', 'Cold Drinks', 'Available in Can, 750ml, 2L', 40, 50, '🥤', true, '[
    {"id": "v_coke_can", "name": "Can (250ml)", "unit": "250ml can", "price": 35, "stock": 20},
    {"id": "v_coke_750", "name": "Bottle (750ml)", "unit": "750ml bottle", "price": 40, "stock": 30},
    {"id": "v_coke_2l", "name": "Party Bottle (2L)", "unit": "2L bottle", "price": 95, "stock": 15}
  ]'::jsonb),
  ('p_thumsup', 'Thums Up Charged Soft Drink', 'Cold Drinks', '750ml pet bottle', 40, 35, '⚡', false, '[]'::jsonb),
  ('p_sprite', 'Sprite Refreshing Lemon Drink', 'Cold Drinks', '750ml pet bottle', 40, 30, '🍋', false, '[]'::jsonb),
  ('p_juice', 'Real Fruit Power Mixed Fruit Juice', 'Cold Drinks', '1 Litre Tetra Pack', 120, 20, '🧃', false, '[]'::jsonb),
  ('p_tea', 'Tata Tea Gold Leaf Tea', 'Cold Drinks', 'Available in 250g & 500g', 160, 30, '☕', true, '[
    {"id": "v_tea_250", "name": "250g Pack", "unit": "250g pack", "price": 160, "stock": 20},
    {"id": "v_tea_500", "name": "500g Pack", "unit": "500g pack", "price": 310, "stock": 10}
  ]'::jsonb),
  ('p_coffee', 'Nescafe Classic Instant Coffee', 'Cold Drinks', '50g Glass Jar', 190, 15, '☕', false, '[]'::jsonb),

  -- Bakery & Cakes
  ('p_parleg', 'Parle-G Original Glucose Biscuits', 'Bakery & Cakes', 'Available in ₹5, ₹25, ₹80', 5, 80, '🍪', true, '[
    {"id": "v_pg_1", "name": "Mini (80g)", "unit": "80g pack", "price": 5, "stock": 50},
    {"id": "v_pg_2", "name": "Family Pack (250g)", "unit": "250g pack", "price": 25, "stock": 30},
    {"id": "v_pg_3", "name": "Jumbo (800g)", "unit": "800g pack", "price": 80, "stock": 15}
  ]'::jsonb),
  ('p_goodday', 'Britannia Good Day Butter Cookies', 'Bakery & Cakes', '100g pack', 20, 45, '🍪', false, '[]'::jsonb),
  ('p_oreo', 'Oreo Original Vanilla Cream Biscuits', 'Bakery & Cakes', '120g pack', 35, 30, '🍪', false, '[]'::jsonb),
  ('p_bread', 'Harvest Gold White Sandwich Bread', 'Bakery & Cakes', '400g loaf', 30, 20, '🍞', false, '[]'::jsonb),
  ('p_pastry', 'Fresh Eggless Chocolate Truffle Pastry', 'Bakery & Cakes', '1 Piece', 60, 15, '🍰', false, '[]'::jsonb),

  -- Ice Cream
  ('p_cornetto', 'Kwality Wall''s Cornetto Double Chocolate', 'Ice Cream', '105ml cone', 40, 25, '🍦', false, '[]'::jsonb),
  ('p_vanilla_tub', 'Amul Vanilla Magic Ice Cream Tub', 'Ice Cream', '1 Litre Tub', 180, 12, '🍨', false, '[]'::jsonb),

  -- Festival Specials & Household
  ('p_gulabjamun', 'Haldiram''s Gulab Jamun Sweet Tin', 'Festival Specials', '1 kg can', 240, 15, '🪔', false, '[]'::jsonb),
  ('p_surf', 'Surf Excel Easy Wash Detergent Powder', 'Daily Essentials & Dairy', '1 kg packet', 145, 25, '🫧', false, '[]'::jsonb),
  ('p_dettol', 'Dettol Original Liquid Handwash Refill', 'Daily Essentials & Dairy', '675ml refill pack', 99, 20, '🧼', false, '[]'::jsonb)

on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  unit = excluded.unit,
  price = excluded.price,
  stock = excluded.stock,
  emoji = excluded.emoji,
  has_variants = excluded.has_variants,
  variants = excluded.variants;

-- REAL STORE BANNERS
insert into public.banners (id, title, image, link) values
  ('b1', 'Fresh Daily Essentials & Dairy Packed in 10 Mins', 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop', 'Daily Essentials & Dairy'),
  ('b2', 'Crispy Snacks, Biscuits & Cold Drinks for Quick Counter Pickup', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=1200&auto=format&fit=crop', 'Chips & Namkeen'),
  ('b3', 'Cool Refreshing Soft Drinks & Ice Creams', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop', 'Cold Drinks')
on conflict (id) do nothing;

-- REAL STORE STAFF
insert into public.staff (id, name, role, phone, active) values
  ('u1', 'Ramesh Yadav', 'Manager', '98765 43210', true),
  ('u3', 'Store Owner (Admin)', 'Admin', '99999 00000', true)
on conflict (id) do nothing;
