-- Apply after 202609220001_field_school.sql.
create table public.school_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track text not null check (track in ('agent', 'fullstack', 'product')),
  score integer not null check (score >= 0),
  total integer not null check (total = 6),
  passed boolean not null,
  attempted_at timestamptz not null default now(),
  constraint school_exam_score_range check (score <= total),
  constraint school_exam_pass_rule check (passed = (score >= 5))
);

create index school_exam_attempts_owner_track on public.school_exam_attempts (user_id, track, attempted_at desc);
alter table public.school_exam_attempts enable row level security;
create policy school_exam_attempts_owner on public.school_exam_attempts for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.school_exam_attempts from anon, authenticated;
grant select on public.school_exam_attempts to authenticated;
grant all on public.school_exam_attempts to service_role;

-- Both writes succeed or fail together. Only the trusted server role may call this function.
create function public.school_record_exam(p_user uuid, p_track text, p_score integer)
returns uuid language plpgsql security definer set search_path = public as $$
declare attempt_id uuid;
begin
  if p_track not in ('agent', 'fullstack', 'product') or p_score < 0 or p_score > 6 then
    raise exception 'invalid exam result';
  end if;
  insert into public.school_exam_attempts (user_id, track, score, total, passed)
    values (p_user, p_track, p_score, 6, p_score >= 5)
    returning id into attempt_id;
  if p_score >= 5 then
    insert into public.school_attestations (user_id, lesson_key, version)
      values (p_user, 'exam:' || p_track, 'exam-v1')
      on conflict (user_id, lesson_key, version) do nothing;
  end if;
  return attempt_id;
end $$;
revoke all on function public.school_record_exam(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.school_record_exam(uuid, text, integer) to service_role;
