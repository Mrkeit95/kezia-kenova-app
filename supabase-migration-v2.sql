-- =====================================================
-- Kezia Kenova - Database Migration v2
-- =====================================================
-- Run this in the Supabase SQL Editor to add the new fields
-- Safe to run multiple times — uses "if not exists"

-- Add new product columns
alter table products add column if not exists price text;
alter table products add column if not exists description text;
alter table products add column if not exists featured boolean default false;

-- Create storage bucket for product images (idempotent)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage policies: public read, authenticated write
drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "auth users can upload product images" on storage.objects;
create policy "auth users can upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "auth users can update product images" on storage.objects;
create policy "auth users can update product images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "auth users can delete product images" on storage.objects;
create policy "auth users can delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');
