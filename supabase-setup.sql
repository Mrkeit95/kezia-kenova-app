-- =====================================================
-- Kezia Kenova - Supabase Database Setup
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

-- 1. PRODUCTS table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text,
  category text not null,
  affiliate_url text,
  image_url text,
  sort_order int default 0,
  visible boolean default true,
  created_at timestamptz default now()
);

-- 2. SUBSCRIBERS table (newsletter signups)
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- 3. CLICKS table (affiliate link tracking)
create table if not exists clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now()
);

-- 4. SETTINGS table (site-wide config, single row)
create table if not exists settings (
  id int primary key default 1,
  location text default 'Bali · Indonesia',
  tagline text default 'model · creator · storyteller',
  instagram_url text default 'https://www.instagram.com/keziaken/',
  tiktok_url text default 'https://www.tiktok.com/@keziaken',
  email text default 'keziakenwork@gmail.com',
  hero_image text default '/kezia.jpeg',
  constraint single_row check (id = 1)
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Public site can READ products/settings
-- Public site can INSERT subscribers and clicks (no login needed)
-- Only authenticated users (Kezia) can edit products/settings or read subscribers/clicks

alter table products enable row level security;
alter table subscribers enable row level security;
alter table clicks enable row level security;
alter table settings enable row level security;

-- PRODUCTS: public can read visible items, admin can do everything
drop policy if exists "public can read visible products" on products;
create policy "public can read visible products" on products
  for select using (visible = true);

drop policy if exists "auth users can do everything on products" on products;
create policy "auth users can do everything on products" on products
  for all using (auth.role() = 'authenticated');

-- SETTINGS: public can read, admin can update
drop policy if exists "public can read settings" on settings;
create policy "public can read settings" on settings for select using (true);

drop policy if exists "auth users can update settings" on settings;
create policy "auth users can update settings" on settings
  for update using (auth.role() = 'authenticated');

-- SUBSCRIBERS: anyone can insert, only admin can read
drop policy if exists "anyone can subscribe" on subscribers;
create policy "anyone can subscribe" on subscribers for insert with check (true);

drop policy if exists "auth users can read subscribers" on subscribers;
create policy "auth users can read subscribers" on subscribers
  for select using (auth.role() = 'authenticated');

-- CLICKS: anyone can insert (track), only admin can read (analytics)
drop policy if exists "anyone can log clicks" on clicks;
create policy "anyone can log clicks" on clicks for insert with check (true);

drop policy if exists "auth users can read clicks" on clicks;
create policy "auth users can read clicks" on clicks
  for select using (auth.role() = 'authenticated');

-- =====================================================
-- DONE. Now create your admin login:
-- =====================================================
-- 1. Go to: Authentication → Users → Add User
-- 2. Email: (Kezia's email — or yours)
-- 3. Password: (set a strong one)
-- 4. Check "Auto Confirm User"
-- 5. Click Create
-- 
-- That account is now the admin login for /admin
