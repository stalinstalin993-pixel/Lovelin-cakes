-- ============================================================================
-- Pistachio & Petal — custom order requests (run once in SQL Editor)
-- Safe to re-run. Customers can add requests without signing in, but cannot
-- read them, change a quote, or see other customers' details. Signed-in bakery
-- users can review, quote and delete requests.
--
-- Photos go to the public `custom-requests` bucket. Visitors cannot list the
-- bucket, and every file gets a random name. Uploads are capped at 2 MB, JPEG.
-- ============================================================================

-- Storage bucket for reference photos ----------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-requests',
  'custom-requests',
  true,
  2097152,
  array['image/jpeg']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can add a file to this bucket. There is deliberately no select policy,
-- so visitors cannot list or read other customers' photos. A public bucket
-- still serves each file by its direct URL, which the bakery receives on WhatsApp.
drop policy if exists "Anyone can upload custom request photos" on storage.objects;
create policy "Anyone can upload custom request photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'custom-requests');

drop policy if exists "Signed-in users can manage custom request photos" on storage.objects;
create policy "Signed-in users can manage custom request photos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'custom-requests')
  with check (bucket_id = 'custom-requests');

-- Requests table --------------------------------------------------------------
create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  needed_on date not null,
  mode text not null default 'pickup' check (mode in ('pickup', 'delivery')),
  address text not null default '' check (char_length(address) <= 200),
  phone text not null default '' check (char_length(phone) <= 15),
  occasion text not null default '' check (char_length(occasion) <= 40),
  size text not null default '' check (char_length(size) <= 60),
  flavour text not null default '' check (char_length(flavour) <= 60),
  cake_message text not null default '' check (char_length(cake_message) <= 40),
  eggless boolean not null default false,
  changes text not null default '' check (char_length(changes) <= 600),
  photos text[] not null default '{}' check (cardinality(photos) <= 3),
  status text not null default 'new'
    check (status in ('new', 'quoted', 'confirmed', 'done', 'cancelled')),
  quote numeric(10, 2) check (quote is null or quote >= 0),
  advance_paid numeric(10, 2) not null default 0 check (advance_paid >= 0),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_requests_created_idx on public.custom_requests (created_at desc);
create index if not exists custom_requests_status_idx on public.custom_requests (status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists custom_requests_touch_updated_at on public.custom_requests;
create trigger custom_requests_touch_updated_at
  before update on public.custom_requests
  for each row execute function public.touch_updated_at();

-- Row-level security ---------------------------------------------------------
alter table public.custom_requests enable row level security;

-- Visitors can add a request, but only as a fresh "new" request with no quote
-- or payment recorded yet.
drop policy if exists "Anyone can submit a custom request" on public.custom_requests;
create policy "Anyone can submit a custom request"
  on public.custom_requests for insert
  to anon, authenticated
  with check (
    status = 'new'
    and quote is null
    and advance_paid = 0
    and notes = ''
  );

drop policy if exists "Signed-in users can read custom requests" on public.custom_requests;
create policy "Signed-in users can read custom requests"
  on public.custom_requests for select
  to authenticated
  using (true);

drop policy if exists "Signed-in users can update custom requests" on public.custom_requests;
create policy "Signed-in users can update custom requests"
  on public.custom_requests for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Signed-in users can delete custom requests" on public.custom_requests;
create policy "Signed-in users can delete custom requests"
  on public.custom_requests for delete
  to authenticated
  using (true);
