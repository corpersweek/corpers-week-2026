-- Run this in Supabase > SQL Editor.
-- These policies allow the public event site to create/read shareable cards
-- and upload/read the public participant photos.

alter table public.participants enable row level security;

create policy "public can create participant cards"
on public.participants for insert
to anon
with check (true);

create policy "public can read participant cards"
on public.participants for select
to anon
using (true);

create policy "public can upload participant photos"
on storage.objects for insert
to anon
with check (bucket_id = 'participant-photos');

create policy "public can read participant photos"
on storage.objects for select
to anon
using (bucket_id = 'participant-photos');
