-- Apply this after 202609280001_guestbook.sql if the original guestbook
-- migration has already been run in the Supabase project.
alter table public.guestbook_messages
  add column if not exists is_anonymous boolean not null default false;

create or replace function public.set_guestbook_author_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_anonymous then
    new.author_name := 'Anonymous';
    return new;
  end if;

  select coalesce(
    nullif(u.raw_user_meta_data ->> 'user_name', ''),
    nullif(u.raw_user_meta_data ->> 'preferred_username', ''),
    nullif(split_part(u.email, '@', 1), ''),
    'GitHub 用户'
  )
  into new.author_name
  from auth.users as u
  where u.id = (select auth.uid());

  if new.author_name is null then
    raise exception 'A valid authenticated user is required';
  end if;

  new.author_name := left(new.author_name, 60);
  return new;
end;
$$;

-- Do not grant public clients access to the internal auth user ID.
revoke select on public.guestbook_messages from anon, authenticated;
grant select (id, author_name, is_anonymous, content, created_at)
  on public.guestbook_messages to anon, authenticated;
