-- Apply once through the Supabase SQL editor or migration CLI.
create table public.school_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_key text not null check (length(lesson_key) between 3 and 160),
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);
create table public.school_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track text not null check (track in ('agent','fullstack','product')),
  repository text not null check (repository ~ '^https://github.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$'),
  reflection text not null check (length(reflection) between 50 and 6000),
  created_at timestamptz not null default now(),
  unique (user_id, track)
);
create table public.school_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 60),
  bio text not null default '' check (length(bio) <= 300),
  is_public boolean not null default false
);
-- Checkpoint attestations are issued by the server, not written by the browser.
create table public.school_attestations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_key text not null,
  version text not null default 'checkpoint-v1',
  issued_at timestamptz not null default now(),
  unique(user_id, lesson_key, version)
);
create table public.school_ai_limits (
  bucket text primary key,
  calls integer not null default 0
);
alter table public.school_progress enable row level security;
alter table public.school_submissions enable row level security;
alter table public.school_profiles enable row level security;
alter table public.school_attestations enable row level security;
alter table public.school_ai_limits enable row level security;
create policy progress_owner on public.school_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy submissions_owner on public.school_submissions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy profiles_owner on public.school_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy profiles_public on public.school_profiles for select to anon, authenticated using (is_public);
create policy attestations_read on public.school_attestations for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.school_ai_limits from anon, authenticated;
revoke all on public.school_attestations from anon, authenticated;
grant select on public.school_attestations to authenticated;
grant select, insert, update, delete on public.school_progress, public.school_submissions, public.school_profiles to authenticated;
grant select on public.school_profiles to anon;

-- Atomic counters shared by all Vercel instances. Failed provider calls also count.
create function public.school_reserve_ai(p_user uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare user_count integer; global_count integer;
begin
  insert into school_ai_limits(bucket, calls) values ('user:' || p_user || ':' || current_date, 1)
    on conflict(bucket) do update set calls = school_ai_limits.calls + 1 returning calls into user_count;
  if user_count > 10 then return false; end if;
  insert into school_ai_limits(bucket, calls) values ('global:' || current_date, 1)
    on conflict(bucket) do update set calls = school_ai_limits.calls + 1 returning calls into global_count;
  return global_count <= 200 and user_count <= 10;
end $$;
revoke all on function public.school_reserve_ai(uuid) from public, anon, authenticated;
grant execute on function public.school_reserve_ai(uuid) to service_role;
grant all on public.school_progress, public.school_submissions, public.school_profiles, public.school_attestations, public.school_ai_limits to service_role;
