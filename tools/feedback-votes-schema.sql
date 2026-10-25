create table if not exists public.feedback_votes(feedback_id uuid references public.beta_feedback(id) on delete cascade,voter text not null,vote integer not null check(vote in(-1,1)),primary key(feedback_id,voter));
create table if not exists public.feedback_vote_limits(client text primary key,started_at timestamptz not null,requests integer not null);
alter table public.feedback_votes enable row level security;
alter table public.feedback_vote_limits enable row level security;
revoke all on public.feedback_votes,public.feedback_vote_limits from public,anon,authenticated;
grant all on public.feedback_votes,public.feedback_vote_limits to service_role;
create policy votes_service on public.feedback_votes for all to service_role using(true) with check(true);
create policy vote_limits_service on public.feedback_vote_limits for all to service_role using(true) with check(true);
create or replace function public.feedback_vote_action(p_client text,p_voter text,p_ids uuid[],p_id uuid default null,p_vote integer default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare used integer; since timestamptz;
begin
 if array_length(p_ids,1)>25 then raise exception 'INVALID'; end if;
 if p_id is not null then
  perform pg_advisory_xact_lock(hashtextextended(p_client,823));
  select requests,started_at into used,since from public.feedback_vote_limits where client=p_client;
  if since>now()-interval '1 minute' and used>=30 then raise exception 'RATE_LIMIT'; end if;
  if not exists(select 1 from public.beta_feedback where id=p_id and is_public) then raise exception 'NOT_FOUND'; end if;
  if p_vote=0 then delete from public.feedback_votes where feedback_id=p_id and voter=p_voter;
  elsif p_vote in(-1,1) then insert into public.feedback_votes values(p_id,p_voter,p_vote) on conflict(feedback_id,voter) do update set vote=excluded.vote;
  else raise exception 'INVALID'; end if;
  delete from public.feedback_vote_limits where started_at<now()-interval '1 day';
  insert into public.feedback_vote_limits values(p_client,now(),1) on conflict(client) do update set started_at=case when public.feedback_vote_limits.started_at>now()-interval '1 minute' then public.feedback_vote_limits.started_at else now() end,requests=case when public.feedback_vote_limits.started_at>now()-interval '1 minute' then public.feedback_vote_limits.requests+1 else 1 end;
 end if;
 return (select coalesce(jsonb_agg(t),'[]'::jsonb) from (select f.id,count(*) filter(where v.vote=1) as agree,count(*) filter(where v.vote=-1) as disagree,coalesce(max(v.vote) filter(where v.voter=p_voter),0) as mine from public.beta_feedback f left join public.feedback_votes v on v.feedback_id=f.id where f.id=any(p_ids) and f.is_public group by f.id) t);
end $$;
revoke all on function public.feedback_vote_action(text,text,uuid[],uuid,integer) from public,anon,authenticated;
grant execute on function public.feedback_vote_action(text,text,uuid[],uuid,integer) to service_role;
