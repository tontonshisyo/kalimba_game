-- Run once in the Supabase project's SQL Editor.
create or replace function public.otoiro_valid_notes(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(value) < 1 or jsonb_array_length(value) > 2000 then return false; end if;
  for item in select jsonb_array_elements(value) loop
    if jsonb_typeof(item) is distinct from 'object' then return false; end if;
    if jsonb_typeof(item->'beat') is distinct from 'number' or jsonb_typeof(item->'lane') is distinct from 'number' then return false; end if;
    if (item->>'beat')::numeric < 0 or (item->>'beat')::numeric > 10000 then return false; end if;
    if (item->>'lane')::numeric < 0 or (item->>'lane')::numeric > 16 or (item->>'lane')::numeric <> trunc((item->>'lane')::numeric) then return false; end if;
  end loop;
  if exists (select 1 from jsonb_array_elements(value) item group by (item->>'beat')::numeric, (item->>'lane')::numeric having count(*) > 1) then return false; end if;
  return true;
end;
$$;

create table if not exists public.community_songs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 40 and char_length(btrim(title)) >= 1),
  bpm integer not null check (bpm between 30 and 240),
  key_signature text not null default 'C' check (key_signature in ('C','G','D','A','E','B','Fs','Cs','F','Bb','Eb','Ab','Db','Gb','Cb')),
  notes jsonb not null check (public.otoiro_valid_notes(notes) and octet_length(notes::text) <= 200000),
  created_at timestamptz not null default now(),
  is_visible boolean not null default true
);
create index if not exists community_songs_newest on public.community_songs (created_at desc, id desc) where is_visible;
alter table public.community_songs enable row level security;
begin;
-- Keep existing submissions for administrators; disable public access and posting.
drop policy if exists community_read on public.community_songs;
drop policy if exists community_post on public.community_songs;
revoke all privileges on public.community_songs from public, anon, authenticated;
revoke all privileges (id, title, bpm, key_signature, notes, created_at, is_visible)
  on public.community_songs from public, anon, authenticated;
-- Existing admin-only RLS policies still restrict these privileges.
grant select, delete on public.community_songs to authenticated;
commit;

