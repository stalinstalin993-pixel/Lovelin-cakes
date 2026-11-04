-- ============================================================================
-- Pistachio & Petal — Supabase setup (run once in the SQL editor)
-- Public can read the menu. Only signed-in bakery users can write.
-- Create the admin user in Authentication > Users (email + password).
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.cakes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  min_weight numeric(5, 2) not null default 1 check (min_weight > 0),
  image text not null default 'images/fallback-cake.webp',
  flavour_choice boolean not null default true,
  no_eggless boolean not null default false,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cakes_category_idx on public.cakes (category);
create index if not exists cakes_sort_order_idx on public.cakes (sort_order);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cakes_touch_updated_at on public.cakes;
create trigger cakes_touch_updated_at
  before update on public.cakes
  for each row execute function public.touch_updated_at();

-- Row-level security ---------------------------------------------------------
alter table public.cakes enable row level security;

drop policy if exists "Cakes are publicly readable" on public.cakes;
create policy "Cakes are publicly readable"
  on public.cakes for select
  using (true);

drop policy if exists "Signed-in users can insert cakes" on public.cakes;
create policy "Signed-in users can insert cakes"
  on public.cakes for insert
  to authenticated
  with check (true);

drop policy if exists "Signed-in users can update cakes" on public.cakes;
create policy "Signed-in users can update cakes"
  on public.cakes for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Signed-in users can delete cakes" on public.cakes;
create policy "Signed-in users can delete cakes"
  on public.cakes for delete
  to authenticated
  using (true);

-- Public photo bucket --------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cake-photos',
  'cake-photos',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Cake photos are publicly readable" on storage.objects;
create policy "Cake photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'cake-photos');

drop policy if exists "Signed-in users can upload cake photos" on storage.objects;
create policy "Signed-in users can upload cake photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cake-photos');

drop policy if exists "Signed-in users can replace cake photos" on storage.objects;
create policy "Signed-in users can replace cake photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cake-photos')
  with check (bucket_id = 'cake-photos');

drop policy if exists "Signed-in users can delete cake photos" on storage.objects;
create policy "Signed-in users can delete cake photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cake-photos');

-- Optional: after creating your user, open /admin.html and click
-- "Import starter menu" to copy cakes.json into this table.
