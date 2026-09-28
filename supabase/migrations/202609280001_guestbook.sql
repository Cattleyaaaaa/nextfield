create table if not exists public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 60),
  is_anonymous boolean not null default false,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_messages_created_at_idx
  on public.guestbook_messages (created_at desc);

-- Never trust a client-supplied display name: derive it from the signed-in
-- Supabase identity even if someone bypasses the website and calls REST directly.
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

drop trigger if exists guestbook_author_name_from_auth on public.guestbook_messages;
create trigger guestbook_author_name_from_auth
  before insert on public.guestbook_messages
  for each row execute function public.set_guestbook_author_name();

alter table public.guestbook_messages enable row level security;

revoke select on public.guestbook_messages from anon, authenticated;
grant select (id, author_name, is_anonymous, content, created_at)
  on public.guestbook_messages to anon, authenticated;
grant insert on public.guestbook_messages to authenticated;

drop policy if exists "Guestbook messages are publicly readable" on public.guestbook_messages;
create policy "Guestbook messages are publicly readable"
  on public.guestbook_messages for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can post their own guestbook messages" on public.guestbook_messages;
create policy "Users can post their own guestbook messages"
  on public.guestbook_messages for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
