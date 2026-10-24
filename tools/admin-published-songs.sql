-- Run once in the Supabase project's SQL Editor after community-schema.sql.
begin;
create table if not exists public.otoiro_official_songs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 40 and char_length(btrim(title)) >= 1),
  bpm integer not null check (bpm between 30 and 240),
  key_signature text not null default 'C' check (key_signature in ('C','G','D','A','E','B','Fs','Cs','F','Bb','Eb','Ab','Db','Gb','Cb')),
  notes jsonb not null check (public.otoiro_valid_notes(notes) and octet_length(notes::text) <= 200000),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists otoiro_official_songs_published_newest
  on public.otoiro_official_songs (created_at, id) where is_published;
alter table public.otoiro_official_songs enable row level security;
revoke all privileges on public.otoiro_official_songs from public, anon, authenticated;
grant select on public.otoiro_official_songs to anon, authenticated;
grant insert, delete on public.otoiro_official_songs to authenticated;
drop policy if exists otoiro_official_songs_public_read on public.otoiro_official_songs;
drop policy if exists otoiro_official_songs_admin_read on public.otoiro_official_songs;
drop policy if exists otoiro_official_songs_admin_insert on public.otoiro_official_songs;
drop policy if exists otoiro_official_songs_admin_delete on public.otoiro_official_songs;
create policy otoiro_official_songs_public_read on public.otoiro_official_songs
  for select to anon, authenticated using (is_published);
create policy otoiro_official_songs_admin_read on public.otoiro_official_songs
  for select to authenticated using (
    exists (select 1 from public.otoiro_admins where user_id = auth.uid())
  );
create policy otoiro_official_songs_admin_insert on public.otoiro_official_songs
  for insert to authenticated with check (
    exists (select 1 from public.otoiro_admins where user_id = auth.uid())
  );
create policy otoiro_official_songs_admin_delete on public.otoiro_official_songs
  for delete to authenticated using (
    exists (select 1 from public.otoiro_admins where user_id = auth.uid())
  );
notify pgrst, 'reload schema'; commit;
