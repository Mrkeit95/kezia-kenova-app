alter table settings
  add column if not exists about_text text default '',
  add column if not exists brand_images text[] default '{}';
