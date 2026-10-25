alter table public.catalog_songs add column if not exists sort_order integer not null default 2147483647;
with ranked as(select id,row_number() over(order by sort_order,created_at,id)::integer as n from public.catalog_songs) update public.catalog_songs s set sort_order=r.n from ranked r where s.id=r.id;
grant update(sort_order) on public.catalog_songs to authenticated;
create or replace function public.move_catalog_song(p_id text,p_direction integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare current_position integer; neighbor text; neighbor_position integer;
begin
 if not exists(select 1 from public.otoiro_admins where user_id=(select auth.uid())) then raise exception 'ADMIN_REQUIRED'; end if;
 if p_direction not in(-1,1) then raise exception 'INVALID_DIRECTION'; end if;
 perform pg_advisory_xact_lock(72931458);
 with ranked as(select id,row_number() over(order by sort_order,created_at,id)::integer as n from public.catalog_songs) update public.catalog_songs s set sort_order=r.n from ranked r where s.id=r.id;
 select sort_order into current_position from public.catalog_songs where id=p_id;
 if current_position is null then raise exception 'NOT_FOUND'; end if;
 select id,sort_order into neighbor,neighbor_position from public.catalog_songs where sort_order=current_position+p_direction;
 if neighbor is null then return false; end if;
 update public.catalog_songs set sort_order=case when id=p_id then neighbor_position else current_position end where id in(p_id,neighbor);
 return true;
end $$;
revoke all on function public.move_catalog_song(text,integer) from public,anon;
grant execute on function public.move_catalog_song(text,integer) to authenticated;
