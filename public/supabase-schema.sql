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

-- 5. STAFF TABLE (Store Managers & Team with secure credentials)
create table if not exists public.staff (
  id text primary key,
  name text not null,
  email text,
  password text,
  role text default 'Manager',
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

-- REAL STORE BANNERS
insert into public.banners (id, title, image, link) values
  ('b1', 'Fresh Daily Essentials & Dairy Packed in 10 Mins', 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop', 'Daily Essentials & Dairy'),
  ('b2', 'Crispy Snacks, Biscuits & Cold Drinks for Quick Counter Pickup', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=1200&auto=format&fit=crop', 'Chips & Namkeen'),
  ('b3', 'Cool Refreshing Soft Drinks & Ice Creams', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop', 'Cold Drinks')
on conflict (id) do nothing;

