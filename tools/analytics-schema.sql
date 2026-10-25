create table if not exists public.usage_events (
 id uuid primary key, visitor uuid not null, session_id uuid not null,
 event text not null, props jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists usage_events_time on public.usage_events(created_at);
create index if not exists usage_events_visitor on public.usage_events(visitor,created_at);
create table if not exists public.usage_rate_limits (client_hash text primary key, bucket date not null, events integer not null);
alter table public.usage_events enable row level security;
alter table public.usage_rate_limits enable row level security;
revoke all on public.usage_events,public.usage_rate_limits from public,anon,authenticated;
grant all on public.usage_events,public.usage_rate_limits to service_role;
grant select on public.usage_events to authenticated;
drop policy if exists usage_admin_read on public.usage_events;
create policy usage_admin_read on public.usage_events for select to authenticated using(exists(select 1 from public.otoiro_admins where user_id=(select auth.uid())));
drop policy if exists usage_rate_service on public.usage_rate_limits;
create policy usage_rate_service on public.usage_rate_limits for all to service_role using(true) with check(true);
create or replace function public.ingest_usage(p_client text,p_visitor uuid,p_session uuid,p_events jsonb) returns integer
language plpgsql security invoker set search_path='' as $$
declare entry jsonb; inserted integer:=0; n integer; used integer;
begin
 n:=jsonb_array_length(p_events);
 if n<1 or n>20 then raise exception 'INVALID'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_client,712));
 select events into used from public.usage_rate_limits where client_hash=p_client and bucket=current_date;
 if coalesce(used,0)+n>2000 then raise exception 'RATE_LIMIT'; end if;
 if (select count(*) from public.usage_events where visitor=p_visitor and created_at>=current_date)>1000 then raise exception 'RATE_LIMIT'; end if;
 delete from public.usage_events where created_at<now()-interval '180 days';
 delete from public.usage_rate_limits where bucket<current_date-1;
 -- Bound retained detail to 100,000 events, removing the oldest 5,000 at capacity.
 if (select count(*) from public.usage_events)>=100000 then
  delete from public.usage_events where id in(select id from public.usage_events order by created_at limit 5000);
 end if;
 for entry in select value from jsonb_array_elements(p_events) loop
  insert into public.usage_events(id,visitor,session_id,event,props) values((entry->>'id')::uuid,p_visitor,p_session,entry->>'event',entry->'props') on conflict(id) do nothing;
  if found then inserted:=inserted+1; end if;
 end loop;
 insert into public.usage_rate_limits values(p_client,current_date,n) on conflict(client_hash) do update set bucket=current_date,events=case when public.usage_rate_limits.bucket=current_date then public.usage_rate_limits.events+n else n end;
 return inserted;
end $$;
revoke all on function public.ingest_usage(text,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.ingest_usage(text,uuid,uuid,jsonb) to service_role;
create or replace function public.usage_dashboard(p_days integer default 30) returns jsonb
language sql stable security invoker set search_path='' as $$
with e as (
 select * from public.usage_events where created_at >= (((now() at time zone 'Asia/Tokyo')::date - (least(90,greatest(1,p_days))-1))::timestamp at time zone 'Asia/Tokyo')
), daily as (
 select (created_at at time zone 'Asia/Tokyo')::date as day,count(distinct visitor) as visitors,count(distinct session_id) as sessions,count(*) filter(where event='visit') as visits,count(*) filter(where event='game_start') as starts,count(*) filter(where event='game_finish') as finishes from e group by 1
), features as (
 select event,props->>'feature' as feature,props->>'mode' as mode,props->>'reason' as reason,count(*) as count,count(distinct visitor) as visitors from e group by 1,2,3,4
), songs as (
 select props->>'song' as song,props->>'mode' as mode,count(*) filter(where event='game_start') as starts,count(*) filter(where event='game_finish') as finishes,count(*) filter(where event='game_exit') as exits,
 round(avg((props->>'accuracy')::numeric) filter(where event='game_finish'),1) as accuracy,
 round(avg((props->>'seconds')::numeric) filter(where event='game_finish'),1) as seconds from e where event in ('game_start','game_finish','game_exit') group by 1,2
), env as (
 select props->>'device' as device,props->>'orientation' as orientation,props->>'browser' as browser,count(*) as visits from e where event='visit' group by 1,2,3
)
select jsonb_build_object(
 'summary',(select jsonb_build_object('visitors',count(distinct visitor),'sessions',count(distinct session_id),'visits',count(*) filter(where event='visit'),'starts',count(*) filter(where event='game_start'),'finishes',count(*) filter(where event='game_finish'),'active_minutes',coalesce(sum((props->>'seconds')::numeric) filter(where event='engaged'),0)/60) from e),
 'daily',coalesce((select jsonb_agg(daily order by day desc) from daily),'[]'::jsonb),
 'features',coalesce((select jsonb_agg(features order by count desc) from features),'[]'::jsonb),
 'songs',coalesce((select jsonb_agg(songs order by starts desc) from songs),'[]'::jsonb),
 'environment',coalesce((select jsonb_agg(env order by visits desc) from env),'[]'::jsonb),
 'short_links',(select jsonb_build_object('stored',count(*),'uses',coalesce(sum(uses),0),'bytes',coalesce(sum(bytes),0)) from public.shared_charts),
 'first_record',(select min(created_at) from public.usage_events)
);
$$;
revoke all on function public.usage_dashboard(integer) from public,anon;
grant execute on function public.usage_dashboard(integer) to authenticated;
