-- Only the Edge Function's service role may access these tables and RPCs.
create table if not exists public.shared_charts (
 id text primary key, fingerprint text not null unique, song jsonb not null,
 bytes integer not null, created_at timestamptz not null default now(),
 last_used_at timestamptz not null default now(), uses bigint not null default 0
);
create index if not exists shared_charts_eviction on public.shared_charts(last_used_at,uses);
create table if not exists public.share_rate_limits (client_hash text primary key, last_created_at timestamptz not null);
alter table public.shared_charts enable row level security;
alter table public.share_rate_limits enable row level security;
revoke all on public.shared_charts, public.share_rate_limits from public,anon,authenticated;
grant all on public.shared_charts, public.share_rate_limits to service_role;
drop policy if exists share_rate_service_only on public.share_rate_limits;
create policy share_rate_service_only on public.share_rate_limits for all to service_role using(true) with check(true);
grant select on public.shared_charts to authenticated;
drop policy if exists shared_charts_admin_read on public.shared_charts;
create policy shared_charts_admin_read on public.shared_charts for select to authenticated using(exists(select 1 from public.otoiro_admins where user_id=(select auth.uid())));
create or replace function public.store_shared_chart(p_client text,p_song jsonb,p_fingerprint text,p_id text)
returns text language plpgsql security invoker set search_path = '' as $$
declare existing text; total_bytes bigint; victim text;
begin
 perform pg_advisory_xact_lock(82761345);
 if exists(select 1 from public.share_rate_limits where client_hash=p_client and last_created_at>now()-interval '3 minutes') then
   raise exception 'RATE_LIMIT';
 end if;
 select id into existing from public.shared_charts where fingerprint=p_fingerprint;
 if existing is not null then
   insert into public.share_rate_limits values(p_client,now()) on conflict(client_hash) do update set last_created_at=excluded.last_created_at;
   return existing;
 end if;
 if octet_length(p_song::text)>131072 then raise exception 'TOO_LARGE'; end if;
 -- Reserve at most 100 MiB for sharing; clean to 90 MiB when near the cap.
 select coalesce(sum(bytes),0) into total_bytes from public.shared_charts;
 if total_bytes+octet_length(p_song::text)>104857600 then
   while total_bytes>94371840 loop
     select id into victim from public.shared_charts order by last_used_at,uses,created_at limit 1;
     exit when victim is null;
     delete from public.shared_charts where id=victim returning total_bytes-bytes into total_bytes;
   end loop;
 end if;
 insert into public.shared_charts(id,fingerprint,song,bytes) values(p_id,p_fingerprint,p_song,octet_length(p_song::text));
 delete from public.share_rate_limits where last_created_at<now()-interval '1 day';
 insert into public.share_rate_limits values(p_client,now()) on conflict(client_hash) do update set last_created_at=excluded.last_created_at;
 return p_id;
end $$;
create or replace function public.read_shared_chart(p_id text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 update public.shared_charts set last_used_at=now(),uses=uses+1 where id=p_id returning song into result;
 return result;
end $$;
revoke all on function public.store_shared_chart(text,jsonb,text,text),public.read_shared_chart(text) from public,anon,authenticated;
grant execute on function public.store_shared_chart(text,jsonb,text,text),public.read_shared_chart(text) to service_role;
