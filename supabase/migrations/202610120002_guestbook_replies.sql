create table if not exists public.guestbook_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.guestbook_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 60),
  is_anonymous boolean not null default false,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_replies_message_created_idx
  on public.guestbook_replies (message_id, created_at);

-- Reuse the existing trigger, which derives display names from the verified
-- Supabase identity and replaces them with "Anonymous" when requested.
drop trigger if exists guestbook_reply_author_name_from_auth on public.guestbook_replies;
create trigger guestbook_reply_author_name_from_auth
  before insert on public.guestbook_replies
  for each row execute function public.set_guestbook_author_name();

alter table public.guestbook_replies enable row level security;

revoke all on public.guestbook_replies from anon, authenticated;
grant select (id, message_id, author_name, is_anonymous, content, created_at)
  on public.guestbook_replies to anon, authenticated;
grant insert on public.guestbook_replies to authenticated;

drop policy if exists "Guestbook replies are publicly readable" on public.guestbook_replies;
create policy "Guestbook replies are publicly readable"
  on public.guestbook_replies for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can post their own guestbook replies" on public.guestbook_replies;
create policy "Users can post their own guestbook replies"
  on public.guestbook_replies for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
