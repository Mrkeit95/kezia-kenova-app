-- =====================================================
-- Kezia Kenova - Database Migration v3
-- =====================================================
-- Adds: journal posts, looks (outfit grids), product galleries, expanded settings
-- Safe to run multiple times

-- JOURNAL POSTS
create table if not exists journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  cover_image text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table journal_posts enable row level security;

drop policy if exists "public can read published posts" on journal_posts;
create policy "public can read published posts" on journal_posts
  for select using (published = true);

drop policy if exists "auth users full access journal" on journal_posts;
create policy "auth users full access journal" on journal_posts
  for all using (auth.role() = 'authenticated');

-- LOOKS (outfit groupings)
create table if not exists looks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image text,
  product_ids uuid[] default '{}',
  sort_order int default 0,
  visible boolean default true,
  created_at timestamptz default now()
);

alter table looks enable row level security;

drop policy if exists "public can read visible looks" on looks;
create policy "public can read visible looks" on looks
  for select using (visible = true);

drop policy if exists "auth users full access looks" on looks;
create policy "auth users full access looks" on looks
  for all using (auth.role() = 'authenticated');

-- PRODUCT GALLERIES - add extra_images column
alter table products add column if not exists extra_images text[] default '{}';

-- Helper function for auto-updating timestamps
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists journal_updated on journal_posts;
create trigger journal_updated before update on journal_posts
  for each row execute function set_updated_at();
