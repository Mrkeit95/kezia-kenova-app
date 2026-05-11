-- =====================================================
-- Kezia Kenova - Database Migration v4
-- =====================================================
-- Adds: hero_images array for multi-image hero carousel
-- Safe to run multiple times

alter table settings add column if not exists hero_images text[] default '{}';

-- Migrate single hero_image into the array if needed
update settings
set hero_images = array[hero_image]
where (hero_images is null or array_length(hero_images, 1) is null)
  and hero_image is not null
  and hero_image != '';
