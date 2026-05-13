-- =====================================================
-- Migration v5: Custom Sections
-- Run in Supabase SQL Editor
-- =====================================================

-- Sections table — each row is a homepage section
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  subtitle text,
  product_ids uuid[] default '{}',
  sort_order int default 0,
  visible boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table sections enable row level security;

-- Public can read visible sections
drop policy if exists "public can read visible sections" on sections;
create policy "public can read visible sections" on sections
  for select using (visible = true);

-- Authenticated users (admin) can do everything
drop policy if exists "auth users can manage sections" on sections;
create policy "auth users can manage sections" on sections
  for all using (auth.role() = 'authenticated');

-- =====================================================
-- Seed: recreate Jewellery, Makeup, Skincare sections
-- (optional — only run if you want to pre-populate)
-- You can also just create them from /admin/sections
-- =====================================================
-- insert into sections (title, slug, subtitle, product_ids, sort_order, visible)
-- values
--   ('Jewellery', 'jewellery', 'the pieces I never take off', '{}', 1, true),
--   ('Makeup',    'makeup',    'my five-minute face',         '{}', 2, true),
--   ('Skincare',  'skincare',  'the routine that keeps my skin glowing', '{}', 3, true)
-- on conflict (slug) do nothing;
