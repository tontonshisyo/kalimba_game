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

